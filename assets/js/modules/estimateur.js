/* Estimateur : pièce → prestations → total en direct sur le compteur d'eau. */
import { env, gsap, html, qs, qsa } from './env.js?v=2';
import { PIECES, PRESTATIONS, euros } from '../data/tarifs.js?v=2';
import { compteurDe } from './compteur.js?v=2';
import { defilerVers, bloquer } from './defilement.js?v=2';

const CLE = 'st-estimation';

export function initEstimateur() {
  const racine = qs('[data-estimateur]');
  if (!racine) return;
  const tuiles = qsa('[data-piece-btn]', racine);
  const listes = qsa('[data-presta]', racine);
  const vide = qs('[data-presta-vide]', racine);
  const inputs = qsa('[data-presta-input]', racine);
  const recap = qs('[data-recap]');
  const lignes = qs('[data-recap-lignes]');
  const compteurs = qsa('[data-compteur]').map(compteurDe).filter(Boolean);
  const barreTotal = qs('[data-barre-total]');
  const resume = qs('[data-demande-total]');
  const choix = new Set();
  let active = null;

  try { (JSON.parse(localStorage.getItem(CLE) || '[]')).forEach((id) => { if (PRESTATIONS.has(id)) choix.add(id); }); } catch (e) { /* rien */ }
  inputs.forEach((i) => { i.checked = choix.has(i.value); });

  function activer(id, { defiler = false } = {}) {
    const piece = PIECES.find((p) => p.id === id);
    if (!piece) return;
    active = id;
    tuiles.forEach((t) => t.setAttribute('aria-pressed', String(t.dataset.pieceBtn === id)));
    vide.hidden = true;
    listes.forEach((l) => { l.hidden = l.dataset.presta !== id; });
    const liste = listes.find((l) => l.dataset.presta === id);
    if (env.anim && liste) {
      gsap.fromTo(qsa('.presta__tete, .groupe legend, .ligne', liste), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.025, ease: 'power3.out' });
    }
    window.ScrollTrigger && window.ScrollTrigger.refresh();
    if (defiler) defilerVers(qs('#etape-presta'));
  }

  function majTotal(source) {
    const items = [...choix].map((id) => PRESTATIONS.get(id)).filter(Boolean);
    const total = items.reduce((s, it) => s + (it.prix || 0), 0);
    compteurs.forEach((c) => c.set(total));
    if (barreTotal) barreTotal.textContent = euros(total);
    // badges sur les tuiles
    tuiles.forEach((t) => {
      const n = items.filter((it) => it.piece === t.dataset.pieceBtn).length;
      const b = qs('[data-tuile-compte]', t);
      if (b) b.textContent = n ? String(n) : '';
    });
    // lignes du récapitulatif, dans l'ordre des pièces
    lignes.textContent = '';
    if (!items.length) {
      const li = document.createElement('li'); li.className = 'recap__rien'; li.textContent = 'Aucune prestation pour l’instant.'; lignes.appendChild(li);
    } else {
      PIECES.forEach((p) => items.filter((it) => it.piece === p.id).forEach((it) => {
        const li = document.createElement('li');
        const nom = document.createElement('span');
        const small = document.createElement('small'); small.textContent = p.court;
        nom.append(small, document.createTextNode(it.nom));
        const prix = document.createElement('span'); prix.className = 'recap__prix'; prix.textContent = euros(it.prix);
        const suppr = document.createElement('button');
        suppr.type = 'button'; suppr.className = 'recap__suppr'; suppr.textContent = '×';
        suppr.setAttribute('aria-label', `Retirer ${it.nom}`);
        suppr.addEventListener('click', () => basculer(it.id, false));
        li.append(nom, prix, suppr);
        lignes.appendChild(li);
      }));
    }
    if (resume) {
      resume.textContent = items.length
        ? `${items.length} prestation${items.length > 1 ? 's' : ''} · ${euros(total)} TTC — ${items.map((i) => i.nom).join(', ')}.`
        : 'Aucune prestation sélectionnée.';
    }
    try { localStorage.setItem(CLE, JSON.stringify([...choix])); } catch (e) { /* rien */ }
    if (source && env.anim) gouttelette(source);
  }

  function basculer(id, on, source) {
    if (on) choix.add(id); else choix.delete(id);
    const input = inputs.find((i) => i.value === id);
    if (input) input.checked = on;
    majTotal(on ? source : null);
  }

  /* une goutte part de la ligne cochée vers le compteur */
  function gouttelette(source) {
    const cible = window.innerWidth < 1000 ? qs('[data-barre-total]') : qs('.compteur--recap');
    if (!cible || !source) return;
    const a = source.getBoundingClientRect(), b = cible.getBoundingClientRect();
    if (b.width === 0) return;
    const g = document.createElement('span');
    g.setAttribute('aria-hidden', 'true');
    Object.assign(g.style, { position: 'fixed', left: '0', top: '0', width: '12px', height: '16px', zIndex: '80', pointerEvents: 'none', background: 'var(--eau-froide)', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', boxShadow: '0 0 0 2px rgba(255,255,255,.7)' });
    document.body.appendChild(g);
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
    gsap.timeline({ onComplete: () => g.remove() })
      .fromTo(g, { x: x0, y: y0, scale: 0.4 }, { x: x1, duration: 0.7, ease: 'power1.inOut' }, 0)
      .fromTo(g, { y: y0 }, { y: Math.min(y0, y1) - 80, duration: 0.32, ease: 'power2.out' }, 0)
      .to(g, { y: y1, duration: 0.38, ease: 'power2.in' }, 0.32)
      .to(g, { scale: 1, duration: 0.3 }, 0)
      .to(g, { scale: 0, opacity: 0, duration: 0.15 }, 0.66);
  }

  tuiles.forEach((t) => t.addEventListener('click', () => activer(t.dataset.pieceBtn, { defiler: true })));
  inputs.forEach((i) => i.addEventListener('change', () => basculer(i.value, i.checked, i.closest('.ligne')?.querySelector('.ligne__prix'))));
  qs('[data-recap-vider]')?.addEventListener('click', () => { choix.clear(); inputs.forEach((i) => { i.checked = false; }); majTotal(); });

  /* tiroir du récapitulatif sur téléphone */
  const ouvrir = qs('[data-recap-ouvrir]');
  const fermer = qs('[data-recap-fermer]');
  const basculerTiroir = (on) => {
    recap.classList.toggle('ouvert', on);
    ouvrir?.setAttribute('aria-expanded', String(on));
    if (window.innerWidth < 1000) bloquer(on);
    if (on) fermer?.focus(); else ouvrir?.focus({ preventScroll: true });
  };
  qs('.recap__in', recap)?.setAttribute('data-lenis-prevent', '');
  ouvrir?.addEventListener('click', () => basculerTiroir(!recap.classList.contains('ouvert')));
  fermer?.addEventListener('click', () => basculerTiroir(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && recap.classList.contains('ouvert')) basculerTiroir(false); });
  qs('[data-recap-demande]')?.addEventListener('click', () => { if (recap.classList.contains('ouvert')) { recap.classList.remove('ouvert'); bloquer(false); } });

  /* pièce indiquée dans l'adresse (?piece=wc) */
  const depuisUrl = (defiler) => {
    const id = new URLSearchParams(location.search).get('piece');
    if (id && PIECES.some((p) => p.id === id)) activer(id, { defiler });
  };
  window.addEventListener('st:url', () => depuisUrl(true));
  depuisUrl(false);
  if (!active) {
    const deja = [...choix].map((id) => PRESTATIONS.get(id)).find(Boolean);
    if (deja) activer(deja.piece);
  }
  majTotal();
  racine.__defilerSiPiece = () => { if (new URLSearchParams(location.search).get('piece')) setTimeout(() => defilerVers(qs('#estimateur')), 250); };

  window.__stEstimation = () => {
    const items = [...choix].map((id) => PRESTATIONS.get(id)).filter(Boolean);
    return { items, total: items.reduce((s, it) => s + (it.prix || 0), 0) };
  };
}
