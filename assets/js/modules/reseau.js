/* Le réseau : une canalisation de cuivre longe la page, se branche dans chaque
   section par un raccord et une vanne, et l'eau y circule au rythme du défilement. */
import { env, gsap, ScrollTrigger, html, qs, qsa, damp } from './env.js?v=2';
import { vitesse } from './defilement.js?v=2';

const NS = 'http://www.w3.org/2000/svg';
const el = (nom, attrs = {}) => { const n = document.createElementNS(NS, nom); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };

export function initReseau() {
  const svg = qs('[data-reseau]');
  if (!svg) return;
  let branches = [];
  let clip = null, fin = 0, dessine = 0, offset = 0, eau = null, tete = null;

  function construire() {
    const W = document.documentElement.clientWidth;
    const H = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    svg.style.height = `${H}px`;
    svg.textContent = '';

    const wrap = qs('main .wrap');
    let gauche = 20;
    if (wrap) {
      const r = wrap.getBoundingClientRect();
      gauche = r.left + parseFloat(getComputedStyle(wrap).paddingLeft);
    }
    const mobile = W < 900;
    const xr = Math.round(Math.max(mobile ? 7 : 16, gauche - (mobile ? 13 : 42)));

    // points de raccordement (sauf dans les sections épinglées, qui recouvrent le réseau)
    const sy = window.scrollY;
    branches = qsa('[data-raccord]').filter((p) => !p.closest('.horizontal:not(.libre), .etapes.epingle')).map((p) => {
      const v = p.querySelector('.vanne') || p;
      const r = v.getBoundingClientRect();
      return { y: Math.round(r.top + sy + r.height / 2), x: Math.round(r.left + 3), vanne: v };
    });
    // le calque ne couvre que la gouttière : moins de surface à repeindre
    const largeur = Math.ceil(Math.max(xr + 20, ...branches.map((b) => b.x + 6)));
    svg.setAttribute('viewBox', `0 0 ${largeur} ${H}`);
    svg.style.width = `${largeur}px`;
    const pied = qs('.pied');
    fin = pied ? pied.getBoundingClientRect().top + sy + 70 : H - 40;

    const defs = el('defs');
    const cp = el('clipPath', { id: 'reseau-clip' });
    clip = el('rect', { x: 0, y: 0, width: W, height: env.anim ? 0 : H });
    cp.appendChild(clip); defs.appendChild(cp); svg.appendChild(defs);

    const dPrincipal = `M${xr} 0 V${fin}`;
    const dBranches = branches.map((b) => `M${xr} ${b.y} H${b.x}`);
    const g = el('g', { 'clip-path': 'url(#reseau-clip)' });
    const couches = ['r-gaine', 'r-cuivre', 'r-reflet', 'r-eau'];
    const groupes = {};
    couches.forEach((c) => {
      const gc = el('g', { class: c });
      gc.appendChild(el('path', { d: dPrincipal }));
      dBranches.forEach((d, i) => { const p = el('path', { d, 'data-branche': i }); gc.appendChild(p); });
      g.appendChild(gc); groupes[c] = gc;
    });
    // raccords en T et bouchon final
    branches.forEach((b) => g.appendChild(el('rect', { class: 'r-raccord', x: xr - (mobile ? 5 : 8), y: b.y - (mobile ? 6 : 9), width: mobile ? 10 : 16, height: mobile ? 12 : 18, rx: 2 })));
    g.appendChild(el('rect', { class: 'r-raccord', x: xr - (mobile ? 5 : 8), y: fin - 4, width: mobile ? 10 : 16, height: 10, rx: 2 }));
    svg.appendChild(g);

    // tête de pose : un manchon et une goutte au bout du tuyau en cours de pose
    tete = null;
    if (env.anim) {
      tete = el('g', { class: 'r-tete' });
      tete.appendChild(el('rect', { class: 'r-raccord', x: xr - (mobile ? 5 : 8), y: -5, width: mobile ? 10 : 16, height: 10, rx: 2 }));
      const k = mobile ? 0.7 : 1;
      tete.appendChild(el('path', { class: 'r-goutte', d: `M${xr} ${8 * k} C${xr + 4 * k} ${14 * k} ${xr + 5 * k} ${16 * k} ${xr + 5 * k} ${19 * k} A${5 * k} ${5 * k} 0 0 1 ${xr - 5 * k} ${19 * k} C${xr - 5 * k} ${16 * k} ${xr - 4 * k} ${14 * k} ${xr} ${8 * k} Z` }));
      svg.appendChild(tete);
    }

    // branches : tracées quand le réseau les atteint
    branches.forEach((b, i) => {
      b.paths = couches.map((c) => groupes[c].querySelector(`[data-branche="${i}"]`));
      const L = Math.max(1, Math.abs(b.x - xr));
      b.L = L;
      if (env.anim) {
        b.paths.slice(0, 3).forEach((p) => { p.style.strokeDasharray = `${L} ${L}`; p.style.strokeDashoffset = String(L); });
        b.paths[3].style.opacity = '0';
        b.fait = false;
      } else { b.vanne.classList.add('ouverte'); }
    });
    if (!env.anim) return;
    dessine = Math.min(dessine, fin);
  }

  construire();
  if (!env.anim) {
    window.addEventListener('resize', () => setTimeout(construire, 150));
    return;
  }
  ScrollTrigger.addEventListener('refresh', construire);

  // tracé progressif + écoulement de l'eau
  gsap.ticker.add((t, dtMs) => {
    const dt = Math.min(dtMs, 64) / 1000;
    const cible = Math.min(fin, window.scrollY + window.innerHeight * 0.68);
    dessine = Math.max(dessine, damp(dessine, cible, 4.5, dt));
    if (clip) clip.setAttribute('height', String(Math.ceil(dessine + 12)));
    if (tete) {
      const cache = dessine >= fin - 8;
      if (tete.__cache !== cache) { tete.style.display = cache ? 'none' : ''; tete.__cache = cache; }
      if (!cache) tete.setAttribute('transform', `translate(0 ${Math.round(dessine + 8)})`);
    }
    branches.forEach((b) => {
      if (!b.fait && dessine >= b.y) {
        b.fait = true;
        gsap.to(b.paths.slice(0, 3), { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out' });
        gsap.to(b.paths[3], { opacity: 1, duration: 0.3, delay: 0.55 });
        gsap.delayedCall(0.55, () => b.vanne.classList.add('ouverte'));
      }
    });
    offset -= dt * (26 + Math.min(260, Math.abs(vitesse()) * 9));
    if (!eau || !eau.isConnected) eau = svg.querySelector('.r-eau');
    if (eau) eau.style.strokeDashoffset = offset.toFixed(1);
  });
}
