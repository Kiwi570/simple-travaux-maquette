/* Les pièces : galerie horizontale épinglée, traversée par la canalisation. */
import { env, gsap, ScrollTrigger, qs, qsa } from './env.js?v=1';

export function initHorizontal() {
  const s = qs('[data-horizontal]');
  if (!s) return;
  const piste = qs('[data-piste]', s);
  const fen = qs('[data-fenetre]', s);
  const svg = qs('[data-piste-tuyau]', s);
  const cuivre = qs('.piste__cuivre', svg);
  const eau = qs('.piste__eau', svg);
  const cartes = qsa('.carte-piece, .carte-fin', piste);
  const num = qs('[data-piste-num]', s);
  const barre = qs('[data-piste-barre]', s);
  let L = 1, x0 = 0;
  // l'eau ne coule que dans la partie déjà posée
  const NS = 'http://www.w3.org/2000/svg';
  const cp = document.createElementNS(NS, 'clipPath'); cp.id = 'piste-clip';
  const rect = document.createElementNS(NS, 'rect'); rect.setAttribute('y', '-10'); rect.setAttribute('height', '60');
  cp.appendChild(rect); svg.prepend(cp); eau.setAttribute('clip-path', 'url(#piste-clip)');

  const tracer = () => {
    const w = piste.scrollWidth;
    svg.setAttribute('viewBox', `0 0 ${w} 34`);
    svg.style.width = `${w}px`;
    const debut = cartes[0] ? cartes[0].offsetLeft + 34 : 0;
    const finX = cartes.length ? cartes[cartes.length - 1].offsetLeft + 40 : w;
    x0 = debut - 60;
    const d = `M${x0} 12 H${finX}`;
    cuivre.setAttribute('d', d); eau.setAttribute('d', d);
    L = Math.max(1, finX - x0);
    rect.setAttribute('x', String(x0)); rect.setAttribute('width', String(L));
  };
  const poser = (visibleDroite) => {
    const long = Math.max(0, Math.min(L, visibleDroite - x0 - 40));
    cuivre.style.strokeDashoffset = String(L - long);
    rect.setAttribute('width', String(long));
  };
  tracer();

  const libre = !env.anim || window.innerHeight < 520;
  if (libre) {
    s.classList.add('libre');
    tracer();
    return;
  }

  const distance = () => Math.max(0, piste.scrollWidth - fen.clientWidth);
  cuivre.style.strokeDasharray = `${L} ${L}`;
  let flux = 0;
  const tween = gsap.fromTo(piste, { x: 0 }, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: s,
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
      anticipatePin: 1,
      onRefresh: () => { tracer(); cuivre.style.strokeDasharray = `${L} ${L}`; poser(-gsap.getProperty(piste, 'x') + fen.clientWidth); },
      onUpdate: (st) => {
        poser(-gsap.getProperty(piste, 'x') + fen.clientWidth);
        if (barre) barre.style.transform = `scaleX(${st.progress.toFixed(4)})`;
        if (num) num.textContent = String(Math.min(cartes.length - 1, 1 + Math.floor(st.progress * (cartes.length - 1)))).padStart(2, '0');
      },
    },
  });
  poser(fen.clientWidth);

  // l'eau circule en continu dans la canalisation
  gsap.ticker.add((t, dtMs) => { flux -= (Math.min(dtMs, 64) / 1000) * 40; eau.style.strokeDashoffset = flux.toFixed(1); });

  // chaque carte se raccorde quand elle entre
  cartes.forEach((c) => {
    const rac = qs('.carte-piece__raccord', c);
    gsap.fromTo(c, { opacity: 0.35, y: 28 }, {
      opacity: 1, y: 0, ease: 'none',
      scrollTrigger: { containerAnimation: tween, trigger: c, start: 'left 98%', end: 'left 70%', scrub: true },
    });
    if (rac) gsap.fromTo(rac, { scaleY: 0, transformOrigin: 'top' }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { containerAnimation: tween, trigger: c, start: 'left 92%', end: 'left 78%', scrub: true },
    });
  });
}
