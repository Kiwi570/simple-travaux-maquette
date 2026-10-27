/* Transitions de page « vidange » : l'eau monte, la page change, l'eau s'évacue. */
import { env, gsap, html, qs } from './env.js?v=1';
import { defilerVers } from './defilement.js?v=1';

/* Chemins comparés sans .html ni index (les adresses en ligne n'ont pas d'extension) */
export const normaliser = (p) => (p.replace(/\/index(\.html)?$/, '/').replace(/\.html$/, '').replace(/\/+$/, '') || '/');

export function initTransitions() {
  const v = qs('[data-vidange]');
  // la position est confiée à GSAP (évite le cumul avec la transformation CSS)
  if (v && gsap) gsap.set(v, { y: 0, yPercent: html.classList.contains('entree') ? 0 : 110 });
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (!/^https?:$/.test(url.protocol) || url.origin !== location.origin) return;

    if (normaliser(url.pathname) === normaliser(location.pathname)) {
      if (url.search !== location.search) {
        e.preventDefault();
        history.replaceState(null, '', url.pathname + url.search + url.hash);
        window.dispatchEvent(new CustomEvent('st:url'));
        return;
      }
      if (url.hash) {
        const cible = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (cible) { e.preventDefault(); defilerVers(cible); history.replaceState(null, '', url.hash); }
      } else { e.preventDefault(); defilerVers(0); }
      return;
    }
    if (!env.anim) return;
    e.preventDefault();
    sortir(url.href);
  });

  window.addEventListener('pageshow', (e) => {
    if (e.persisted) { const v = qs('[data-vidange]'); if (v && gsap) gsap.set(v, { yPercent: 110 }); }
  });
}

function sortir(href) {
  const v = qs('[data-vidange]');
  try { sessionStorage.setItem('st-transition', '1'); } catch (e) { /* rien */ }
  if (!v) { location.href = href; return; }
  gsap.timeline({ onComplete: () => { location.href = href; } })
    .fromTo(v, { yPercent: 110 }, { yPercent: 0, duration: 0.55, ease: 'power3.inOut' });
}

export function entree() {
  const v = qs('[data-vidange]');
  try { sessionStorage.removeItem('st-transition'); } catch (e) { /* rien */ }
  if (!v || !env.anim) { html.classList.remove('entree'); return Promise.resolve(); }
  return new Promise((pret) => {
    gsap.timeline({ onComplete: () => { html.classList.remove('entree'); pret(); } })
      .fromTo(v, { yPercent: 0 }, { yPercent: 110, duration: 0.7, ease: 'power3.inOut', delay: 0.05 })
      .call(pret, null, 0.3);
  });
}
