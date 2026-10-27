/* Micro-interactions : boutons magnétiques, cartes inclinées, curseur réticule. */
import { env, gsap, html, qs, qsa, damp } from './env.js?v=1';

export function initMagnetiques() {
  if (!env.anim || !env.fin) return;
  qsa('[data-magnet]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.28);
      y((e.clientY - (r.top + r.height / 2)) * 0.36);
    });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}

export function initInclinaisons() {
  if (!env.anim || !env.fin) return;
  qsa('[data-tilt]').forEach((el) => {
    gsap.set(el, { transformPerspective: 900 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.7, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.7, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * 9); rx(-py * 9);
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
}

export function initCurseur() {
  const c = qs('[data-curseur]');
  if (!c || !env.anim || !env.fin) return;
  html.classList.add('curseur-actif');
  const coord = qs('[data-curseur-coord]', c);
  const label = qs('[data-curseur-label]', c);
  const rond = qs('.curseur__rond', c);
  let tx = -100, ty = -100, x = -100, y = -100, px = 0, py = 0, visible = false;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    tx = e.clientX; ty = e.clientY; px = e.pageX; py = e.pageY;
    if (!visible) { x = tx; y = ty; visible = true; c.style.opacity = '1'; }
    const cible = e.target.closest ? e.target.closest('a, button, label, [data-ripple], input, textarea') : null;
    const survol = !!cible && !cible.matches('input, textarea');
    c.classList.toggle('survol', survol);
    let txt = '';
    if (cible) {
      if (cible.dataset.curseurTexte) txt = cible.dataset.curseurTexte;
      else if (cible.matches('a[href^="tel:"]')) txt = 'Appeler';
      else if (cible.matches('a[href^="sms:"]')) txt = 'SMS';
    }
    if (label.textContent !== txt) label.textContent = txt;
    c.classList.toggle('sombre-fond', !!(e.target.closest && e.target.closest('.sombre, .menu, .carte-fin')));
    gsap.to(rond, { scale: survol ? 1.7 : 1, duration: 0.4, ease: 'power3.out', overwrite: true });
  }, { passive: true });
  document.addEventListener('pointerleave', () => { visible = false; c.style.opacity = '0'; });
  gsap.ticker.add((t, dtMs) => {
    const dt = Math.min(dtMs, 64) / 1000;
    x = damp(x, tx, 22, dt); y = damp(y, ty, 22, dt);
    c.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    coord.textContent = `X ${String(Math.round(px)).padStart(4, '0')} · Y ${String(Math.round(py)).padStart(4, '0')}`;
  });
}
