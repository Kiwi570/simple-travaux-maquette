/* Révélations au défilement : titres ligne par ligne, textes, cotes de plan, images. */
import { env, gsap, ScrollTrigger, qs, qsa } from './env.js?v=2';

export function initApparitions(intro) {
  if (!env.anim) {
    qsa('.eyebrow .vanne').forEach((v) => v.classList.add('ouverte'));
    return;
  }
  const premier = qs('[data-section]');
  const dansIntro = (el) => premier && premier.contains(el);

  /* Titres */
  qsa('[data-split]').forEach((el) => {
    let cibles = [el];
    if (window.SplitText) {
      const split = window.SplitText.create(el, { type: 'lines,words', mask: 'lines', linesClass: 'split-ligne', aria: 'auto' });
      cibles = split.words.length ? split.words : [el];
    }
    gsap.set(cibles, { yPercent: 105 });
    const jouer = (rapide) => gsap.fromTo(cibles, { yPercent: 105 }, {
      yPercent: 0, duration: rapide ? 0.8 : 0.95, stagger: rapide ? 0.028 : 0.035, ease: 'power4.out',
      onComplete: () => { if (rapide && !window.__stTitre) window.__stTitre = performance.now(); },
    });
    if (dansIntro(el)) intro.then(() => jouer(true));
    else ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: jouer });
  });

  /* Paragraphes et blocs */
  qsa('[data-apparait]').forEach((el, i) => {
    gsap.set(el, { opacity: 0, y: 26 });
    const jouer = (delai = 0) => gsap.fromTo(el, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.9, delay: delai, ease: 'power3.out' });
    if (dansIntro(el)) intro.then(() => jouer(0.25 + (i % 4) * 0.08));
    else ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => jouer(0.05) });
  });

  /* Images révélées comme un tirage, cotes qui se tracent */
  qsa('[data-cotes]').forEach((fig) => {
    const img = fig.querySelector(':scope > img, :scope > picture img, :scope > div > img, :scope > svg.portrait-provisoire');
    // cotes : tracées par une mise à l'échelle (le pointillé de DrawSVG se déforme avec vector-effect)
    const cotes = [...fig.querySelectorAll('.cote')];
    const axe = (c) => (/V/.test(c.getAttribute('d') || '') ? 'scaleY' : 'scaleX');
    if (img) gsap.set(img, { clipPath: 'inset(0% 0% 100% 0%)' });
    cotes.forEach((c) => gsap.set(c, { [axe(c)]: 0 }));
    const jouer = () => {
      const tl = gsap.timeline();
      if (img) tl.fromTo(img, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'expo.inOut' }, 0);
      cotes.forEach((c, i) => tl.fromTo(c, { [axe(c)]: 0 }, { [axe(c)]: 1, duration: 0.9, ease: 'power2.inOut' }, 0.35 + i * 0.15));
    };
    if (dansIntro(fig)) intro.then(jouer);
    else ScrollTrigger.create({ trigger: fig, start: 'top 82%', once: true, onEnter: jouer });
  });

  /* Listes cochées une à une */
  qsa('[data-coches]').forEach((ul) => {
    const li = ul.querySelectorAll('li');
    gsap.set(li, { opacity: 0, x: -14 });
    ScrollTrigger.create({ trigger: ul, start: 'top 85%', once: true, onEnter: () => gsap.fromTo(li, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out' }) });
  });

  /* Parallaxe douce des images */
  qsa('[data-parallaxe]').forEach((el) => {
    const cible = el.querySelector('img') || el;
    gsap.fromTo(cible, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

}
