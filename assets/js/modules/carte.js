/* Zone d'intervention : le compas balaie le rayon de 30 km, les communes s'allument. */
import { env, gsap, ScrollTrigger, qs, qsa } from './env.js?v=3';
import { CENTRE } from '../data/site.js?v=3';

export function initCarte() {
  qsa('[data-carte]').forEach((fig) => {
    const svg = qs('[data-carte-svg]', fig);
    const info = qs('[data-carte-info]', fig);
    const section = fig.closest('section');
    const villes = qsa('.ville[data-ville]', svg);
    const compas = qs('[data-compas]', svg);
    const btns = qsa('[data-ville-btn]', section);
    const centre = qs('.ville--centre circle', svg);
    const cx = Number(centre.getAttribute('cx')), cy = Number(centre.getAttribute('cy'));

    const consigne = window.matchMedia && matchMedia('(hover: hover)').matches ? 'Survolez une commune' : 'Touchez une commune';
    if (info) info.textContent = consigne;
    const activer = (nom, on) => {
      villes.forEach((v) => v.classList.toggle('actif', on && v.dataset.ville === nom));
      btns.forEach((b) => b.classList.toggle('actif', on && b.dataset.villeBtn === nom));
      const v = villes.find((x) => x.dataset.ville === nom);
      if (info) info.textContent = on && v ? `${nom} · ≈ ${v.dataset.km} km de ${CENTRE.nom} à vol d’oiseau` : consigne;
    };
    villes.forEach((v) => {
      v.addEventListener('pointerenter', () => activer(v.dataset.ville, true));
      v.addEventListener('pointerleave', () => activer(v.dataset.ville, false));
    });
    btns.forEach((b) => {
      ['pointerenter', 'focus'].forEach((ev) => b.addEventListener(ev, () => activer(b.dataset.villeBtn, true)));
      ['pointerleave', 'blur'].forEach((ev) => b.addEventListener(ev, () => activer(b.dataset.villeBtn, false)));
      b.addEventListener('click', () => activer(b.dataset.villeBtn, true));
    });

    if (!env.anim) { villes.forEach((v) => v.classList.add('allume')); if (compas) compas.style.display = 'none'; return; }

    const rayon = qsa('.carte__rayon, .carte__anneau, .carte__oise', svg);
    gsap.set(rayon, { drawSVG: '0%' });
    gsap.set(villes, { opacity: 0.35 });
    const angle = (v) => ((Number(v.dataset.angle) % 360) + 360) % 360;
    const etat = { a: 0 };
    let balaye = false;
    const rotation = gsap.to(etat, {
      a: 360, duration: 7, repeat: -1, ease: 'none', paused: true,
      onUpdate: () => {
        gsap.set(compas, { rotation: etat.a, svgOrigin: `${cx} ${cy}` });
        if (!balaye) {
          villes.forEach((v) => {
            if (!v.classList.contains('allume') && angle(v) <= etat.a) {
              v.classList.add('allume');
              gsap.fromTo(v, { opacity: 0.35 }, { opacity: 1, duration: 0.4 });
              gsap.fromTo(v.querySelector('circle'), { scale: 2.2, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.6, ease: 'back.out(2)' });
            }
          });
          if (etat.a > 359) balaye = true;
        }
      },
    });
    ScrollTrigger.create({
      trigger: fig, start: 'top 80%', end: 'bottom top',
      onEnter: () => {
        gsap.fromTo(rayon, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.4, stagger: 0.12, ease: 'power2.inOut' });
        rotation.play();
      },
      onLeave: () => rotation.pause(),
      onEnterBack: () => rotation.play(),
      onLeaveBack: () => rotation.pause(),
    });
  });
}
