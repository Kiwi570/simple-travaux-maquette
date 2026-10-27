/* En-tête : menu mobile, mode calme, voyants d'ouverture, barre fixe. */
import { env, html, qs, qsa, gsap } from './env.js?v=1';
import { bloquer, lenis } from './defilement.js?v=1';
import { SITE } from '../data/site.js?v=1';

export function initMenu() {
  const btn = qs('[data-menu]');
  const panneau = qs('[data-menu-panneau]');
  if (!btn || !panneau) return;
  const fermer = (rendreFocus = true) => {
    btn.setAttribute('aria-expanded', 'false');
    panneau.hidden = true;
    bloquer(false);
    qs('[data-barre]')?.classList.remove('masquee-menu');
    if (rendreFocus) btn.focus();
  };
  btn.addEventListener('click', () => {
    const ouvert = btn.getAttribute('aria-expanded') === 'true';
    if (ouvert) { fermer(false); return; }
    btn.setAttribute('aria-expanded', 'true');
    panneau.hidden = false;
    bloquer(true);
    if (env.anim && gsap) {
      gsap.fromTo(panneau, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.55, ease: 'power3.out' });
      gsap.fromTo(qsa('nav a, .menu__tel, .menu__horaires', panneau), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, delay: 0.12, ease: 'power3.out' });
    }
    qs('nav a', panneau)?.focus();
  });
  panneau.addEventListener('click', (e) => { if (e.target.closest('a')) fermer(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panneau.hidden) fermer(); });
  window.addEventListener('resize', () => { if (window.innerWidth >= 900 && !panneau.hidden) fermer(false); });
}

/* Mode calme : bascule mémorisée, rechargement, retour à la même section */
export function initCalme() {
  qsa('[data-calme]').forEach((b) => {
    b.setAttribute('aria-pressed', String(env.calme));
    b.addEventListener('click', () => {
      const sections = qsa('[data-section]');
      let idx = 0;
      sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= window.innerHeight * 0.35) idx = i; });
      try {
        localStorage.setItem('st-calme', env.calme ? '0' : '1');
        sessionStorage.setItem('st-calme-retour', String(idx));
        sessionStorage.setItem('st-vu', '1');
      } catch (e) { /* rien */ }
      location.reload();
    });
  });
}

export function restaurerPosition() {
  let idx = null;
  try { idx = sessionStorage.getItem('st-calme-retour'); sessionStorage.removeItem('st-calme-retour'); } catch (e) { /* rien */ }
  if (idx === null) return;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const aller = () => {
    const s = qsa('[data-section]')[Number(idx)];
    if (!s) return;
    const spacer = s.parentElement && s.parentElement.classList.contains('pin-spacer') ? s.parentElement : null;
    const ent = parseFloat(getComputedStyle(html).getPropertyValue('--entete-h')) || 64;
    const y = idx === '0' ? 0 : Math.max(0, (spacer || s).getBoundingClientRect().top + window.scrollY - (spacer ? 0 : ent));
    window.scrollTo(0, y);
    if (lenis) { lenis.resize(); lenis.scrollTo(y, { immediate: true, force: true }); }
    if (window.ScrollTrigger) window.ScrollTrigger.update();
  };
  // après le chargement complet (images, recalcul des sections épinglées)
  if (document.readyState === 'complete') setTimeout(aller, 120);
  else window.addEventListener('load', () => setTimeout(aller, 160), { once: true });
}

/* « Ouvert maintenant », calculé à l'heure de Paris */
const JOURS = { dim: 0, lun: 1, mar: 2, mer: 3, jeu: 4, ven: 5, sam: 6 };
export function etatOuverture(d = new Date()) {
  let j = d.getDay(), h = d.getHours(), m = d.getMinutes();
  try {
    const parts = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(d);
    const get = (t) => (parts.find((p) => p.type === t) || {}).value || '';
    j = JOURS[get('weekday').replace('.', '').slice(0, 3).toLowerCase()] ?? j;
    h = parseInt(get('hour'), 10); m = parseInt(get('minute'), 10);
  } catch (e) { /* fuseau indisponible : heure locale */ }
  const { jours, debut, fin } = SITE.horaires;
  const minutes = h * 60 + m;
  const ouvert = jours.includes(j) && minutes >= debut * 60 && minutes < fin * 60;
  if (ouvert) return { ouvert, texte: `Ouvert · jusqu’à ${fin}h` };
  if (jours.includes(j) && minutes < debut * 60) return { ouvert, texte: `Fermé · ouvre à ${debut}h` };
  const demain = (j + 1) % 7;
  if (jours.includes(demain)) return { ouvert, texte: `Fermé · ouvre demain ${debut}h` };
  return { ouvert, texte: `Fermé · ouvre lundi ${debut}h` };
}

export function initVoyants() {
  const maj = () => {
    const e = etatOuverture();
    qsa('[data-voyant]').forEach((v) => {
      v.classList.toggle('ouvert', e.ouvert);
      v.classList.toggle('ferme', !e.ouvert);
      const t = qs('[data-voyant-texte]', v);
      if (t) t.textContent = e.texte;
    });
  };
  maj();
  setInterval(maj, 60000);
}

/* Barre fixe téléphone : masquée sur les formulaires, le pied de page et pendant la saisie */
export function initBarre() {
  const b = qs('[data-barre]');
  if (!b) return;
  const visibles = new Set();
  let saisie = false;
  const maj = () => b.classList.toggle('masquee', visibles.size > 0 || saisie);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? visibles.add(e.target) : visibles.delete(e.target)));
      maj();
    }, { rootMargin: '0px 0px -12% 0px' });
    qsa('[data-masque-barre]').forEach((m) => io.observe(m));
  }
  document.addEventListener('focusin', (e) => { if (e.target.matches('input:not([type=checkbox]):not([type=radio]), textarea')) { saisie = true; maj(); } });
  document.addEventListener('focusout', () => { saisie = false; maj(); });
}
