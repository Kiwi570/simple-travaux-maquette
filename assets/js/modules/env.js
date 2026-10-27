/* Environnement partagé : préférences, bibliothèques, mesures. */
export const html = document.documentElement;
const mq = (q) => !!(window.matchMedia && window.matchMedia(q).matches);

export const gsap = window.gsap;
export const ScrollTrigger = window.ScrollTrigger;

// Bibliothèques absentes : la maquette reste complète, sans animation
if (!gsap || !ScrollTrigger) html.classList.add('calme');

export const env = {
  calme: html.classList.contains('calme'),
  get anim() { return !this.calme; },
  fin: mq('(hover: hover) and (pointer: fine)'),
  page: document.body.dataset.page || '',
  mobile: () => window.innerWidth < 900,
};

if (gsap && ScrollTrigger) {
  const plugins = [ScrollTrigger, window.SplitText, window.DrawSVGPlugin].filter(Boolean);
  gsap.registerPlugin(...plugins);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export const qs = (s, r = document) => r.querySelector(s);
export const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
/* Lissage indépendant de la cadence d'affichage */
export const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));

/* Hauteurs réelles de l'en-tête et de la barre fixe, exposées en CSS */
export function mesurer() {
  const e = qs('[data-entete]');
  if (e) html.style.setProperty('--entete-h', `${Math.ceil(e.getBoundingClientRect().height)}px`);
  const b = qs('[data-barre]');
  let h = 0;
  if (b) {
    const cs = getComputedStyle(b);
    if (cs.display !== 'none' && cs.position === 'fixed') {
      const r = b.getBoundingClientRect();
      if (r.left < 4 && r.width >= window.innerWidth - 4) h = Math.ceil(r.height);
    }
  }
  html.style.setProperty('--barres-h', `${h}px`);
}
window.addEventListener('resize', mesurer);

export function policesPretes(max = 1200) {
  if (!document.fonts || !document.fonts.ready) return Promise.resolve();
  return Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, max))]);
}

export function surVisibilite(el, cb, marge = '0px') {
  if (!('IntersectionObserver' in window)) { cb(true); return null; }
  const io = new IntersectionObserver((es) => es.forEach((e) => cb(e.isIntersecting)), { rootMargin: marge });
  io.observe(el);
  return io;
}
