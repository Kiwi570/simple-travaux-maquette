/* Défilement fluide (Lenis) synchronisé avec ScrollTrigger.
   Le défilement natif reste la référence : Lenis lisse seulement la molette. */
import { env, gsap, ScrollTrigger, html } from './env.js?v=2';

export let lenis = null;

export function initDefilement() {
  if (!env.anim) return;
  // pendant le défilement, les animations décoratives en boucle se mettent en pause (moins de travail par image)
  let minuterie = 0;
  window.addEventListener('scroll', () => {
    if (!html.classList.contains('defile-actif')) html.classList.add('defile-actif');
    clearTimeout(minuterie);
    minuterie = setTimeout(() => html.classList.remove('defile-actif'), 180);
  }, { passive: true });
  if (!window.Lenis) return;
  lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true, syncTouch: false, allowNestedScroll: true, respectReducedMotion: false });
  lenis.on('scroll', ScrollTrigger.update);
  window.__stLenis = lenis;
  ScrollTrigger.addEventListener('refresh', () => lenis.resize());
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function decalageEntete() {
  return -(parseFloat(getComputedStyle(html).getPropertyValue('--entete-h')) || 64) - 12;
}

export function defilerVers(cible, { immediat = false, decalage } = {}) {
  const el = typeof cible === 'string' ? document.querySelector(cible) : cible;
  const offset = decalage ?? (typeof cible === 'number' ? 0 : decalageEntete());
  if (lenis) {
    lenis.scrollTo(el || cible, { offset, duration: 1.15, immediate: immediat });
    return;
  }
  let y = typeof cible === 'number' ? cible : 0;
  if (el && el.getBoundingClientRect) y = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top: y, behavior: immediat || env.calme ? 'auto' : 'smooth' });
}

export function bloquer(oui) {
  if (lenis) (oui ? lenis.stop() : lenis.start());
  document.body.style.overflow = oui ? 'hidden' : '';
}

export function vitesse() { return lenis ? lenis.velocity : 0; }
