/* Héros : la maison en coupe se dessine, les réseaux se remplissent,
   les points d'intervention apparaissent avec leur prix. */
import { env, gsap, qs, qsa, surVisibilite } from './env.js?v=2';

export function initCoupe(intro) {
  const svg = qs('[data-coupe-svg]');
  if (!svg) return;
  const planche = svg.closest('[data-planche]');

  // calques d'écoulement : copie des réseaux d'eau, en pointillés animés
  ['reseau-froid', 'reseau-chaud', 'reseau-cuivre'].forEach((cls) => {
    const g = svg.querySelector('.' + cls);
    const f = g.cloneNode(true);
    f.setAttribute('class', 'flux' + (cls === 'reseau-cuivre' ? ' flux--lent' : ''));
    g.after(f);
  });

  // survol synchronisé point ↔ étiquette
  const lier = (piece, on) => {
    qsa(`[data-point="${piece}"], [data-etiquette="${piece}"]`).forEach((n) => n.classList.toggle('actif', on));
  };
  qsa('[data-point], [data-etiquette]').forEach((n) => {
    const piece = n.dataset.point || n.dataset.etiquette;
    n.addEventListener('pointerenter', () => lier(piece, true));
    n.addEventListener('pointerleave', () => lier(piece, false));
    n.addEventListener('focus', () => lier(piece, true));
    n.addEventListener('blur', () => lier(piece, false));
  });

  surVisibilite(planche, (vis) => svg.classList.toggle('hors-ecran', !vis));
  if (!env.anim) return;

  const traits = svg.querySelectorAll('.coupe__structure .trait, .coupe__structure .fenetre');
  const murs = svg.querySelectorAll('.coupe__structure .mur');
  const terre = svg.querySelector('.coupe__terre');
  const equip = svg.querySelectorAll('.coupe__equipements > *');
  const evac = svg.querySelectorAll('.reseau-evac path, .reseau-elec path');
  const froid = svg.querySelectorAll('.reseau-froid path');
  const chaud = svg.querySelectorAll('.reseau-chaud path, .reseau-cuivre path');
  const flux = svg.querySelectorAll('.flux');
  const points = svg.querySelectorAll('.coupe__point');
  const etiquettes = qsa('.coupe__etiquette-in');
  const calqueEtiquettes = qs('.coupe__etiquettes', planche);
  const photo = qs('.planche__photo', planche);
  const cartouche = qs('.cartouche', planche);

  gsap.set(traits, { drawSVG: '0%' });
  gsap.set(murs, { fillOpacity: 0 });
  gsap.set(terre, { opacity: 0 });
  gsap.set(equip, { opacity: 0, y: 6 });
  gsap.set([...evac, ...froid, ...chaud], { drawSVG: '0%' });
  gsap.set(flux, { opacity: 0 });
  gsap.set(points, { scale: 0, transformOrigin: '50% 50%' });
  gsap.set(etiquettes, { opacity: 0, y: 8 });
  if (photo) gsap.set(photo, { clipPath: 'inset(0% 0% 100% 0%)' });
  if (cartouche) gsap.set(cartouche, { opacity: 0 });

  intro.then(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    tl.fromTo(traits, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1, stagger: 0.025 }, 0)
      .fromTo(murs, { fillOpacity: 0 }, { fillOpacity: 1, duration: 0.6 }, 0.5)
      .fromTo(terre, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.5)
      .fromTo(equip, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.012, ease: 'power2.out' }, 0.7)
      .fromTo(evac, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.7, stagger: 0.03 }, 1.0)
      .fromTo(froid, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, stagger: 0.04 }, 1.15)
      .fromTo(chaud, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, stagger: 0.04 }, 1.35)
      .fromTo(flux, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.9)
      .fromTo(points, { scale: 0 }, { scale: 1, duration: 0.5, stagger: 0.05, ease: 'back.out(2.4)' }, 1.7)
      .fromTo(etiquettes, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power3.out' }, 1.85);
    if (photo) tl.fromTo(photo, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' }, 0.4);
    if (cartouche) tl.fromTo(cartouche, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.9);
  });

  // profondeur au mouvement de la souris
  if (env.fin && planche) {
    const couches = [
      [svg.querySelector('.coupe__structure'), 4],
      [svg.querySelector('.coupe__equipements'), 7],
      [svg.querySelector('.coupe__reseaux'), 10],
      [svg.querySelector('.coupe__points'), 14],
      [calqueEtiquettes, 13],
    ].filter(([n]) => n).map(([n, f]) => ({ f, x: gsap.quickTo(n, 'x', { duration: 0.9, ease: 'power3' }), y: gsap.quickTo(n, 'y', { duration: 0.9, ease: 'power3' }) }));
    const pX = photo ? gsap.quickTo(photo, 'x', { duration: 1, ease: 'power3' }) : null;
    const pY = photo ? gsap.quickTo(photo, 'y', { duration: 1, ease: 'power3' }) : null;
    planche.addEventListener('pointermove', (e) => {
      const r = planche.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      couches.forEach((c) => { c.x(nx * c.f); c.y(ny * c.f); });
      if (pX) { pX(-nx * 18); pY(-ny * 14); }
    });
    planche.addEventListener('pointerleave', () => { couches.forEach((c) => { c.x(0); c.y(0); }); if (pX) { pX(0); pY(0); } });
  }

  // la planche s'éloigne doucement au défilement
  gsap.fromTo(qs('.planche', planche), { yPercent: 0 }, { yPercent: -5, ease: 'none', scrollTrigger: { trigger: planche, start: 'top top+=20%', end: 'bottom top', scrub: true } });
}
