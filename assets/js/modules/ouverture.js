/* Ouverture orchestrée : le tuyau trace le nom, l'eau s'y écoule, le plan s'ouvre. */
import { env, gsap, html, qs } from './env.js?v=3';

export function ouvrir() {
  const o = qs('[data-ouverture]');
  if (!o) return Promise.resolve();
  if (!env.anim || html.classList.contains('deja-vu')) { o.remove(); return Promise.resolve(); }
  try { sessionStorage.setItem('st-vu', '1'); } catch (e) { /* stockage indisponible */ }

  return new Promise((pret) => {
    const cuivre = qs('.ouverture__cuivre', o);
    const eau = qs('.ouverture__eau', o);
    const mots = o.querySelectorAll('.ouverture__l1, .ouverture__l2');
    const sous = qs('.ouverture__sous', o);
    const tl = gsap.timeline({ onComplete: () => { o.remove(); pret(); } });
    tl.fromTo(cuivre, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.85, ease: 'power2.inOut' }, 0)
      .fromTo(eau, { opacity: 0, strokeDashoffset: 0 }, { opacity: 1, duration: 0.25 }, 0.6)
      .fromTo(eau, { strokeDashoffset: 0 }, { strokeDashoffset: -160, duration: 1.1, ease: 'none' }, 0.6)
      .fromTo(mots, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, 0.22)
      .fromTo(sous, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0.5)
      .to(qs('.ouverture__centre', o), { opacity: 0, y: -16, duration: 0.3, ease: 'power2.in' }, 1.25)
      .to(qs('.ouverture__feuille--haut', o), { yPercent: -101, duration: 0.65, ease: 'power3.inOut' }, 1.32)
      .to(qs('.ouverture__feuille--bas', o), { yPercent: 101, duration: 0.65, ease: 'power3.inOut' }, 1.32);
    // la page commence à s'animer pendant que le plan s'ouvre
    tl.call(pret, null, 1.22);
  });
}
