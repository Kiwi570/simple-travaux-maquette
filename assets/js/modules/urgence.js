/* Urgence : bandeau qui défile avec le défilement, gouttes qui tombent du raccord. */
import { env, gsap, qs, qsa, surVisibilite } from './env.js?v=3';
import { vitesse } from './defilement.js?v=3';

export function initDefile() {
  const piste = qs('[data-defile]');
  if (!piste || !env.anim) return;
  let x = 0, actif = true, sens = 1;
  surVisibilite(piste, (v) => { actif = v; }, '100px');
  gsap.ticker.add((t, dtMs) => {
    if (!actif) return;
    const dt = Math.min(dtMs, 64) / 1000;
    const v = vitesse();
    if (Math.abs(v) > 0.5) sens = v > 0 ? 1 : -1;
    x -= dt * sens * (60 + Math.min(900, Math.abs(v) * 28));
    const moitie = piste.scrollWidth / 2;
    if (moitie > 0) { if (x <= -moitie) x += moitie; if (x > 0) x -= moitie; }
    piste.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
  });
}

export function initGouttes() {
  const zone = qs('[data-gouttes]');
  const canvas = qs('[data-gouttes-canvas]');
  if (!zone || !canvas || !env.anim) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, env.fin ? 1.25 : 1);
  let W = 0, H = 0, actif = false, cadence = 1.1, attente = 0;
  const gouttes = [], eclats = [];
  // position du raccord dans la photo (goutte qui se forme), en proportion
  const source = { x: 0.6, y: 0.66 };

  const dimensionner = () => {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  dimensionner();
  window.addEventListener('resize', dimensionner);
  surVisibilite(zone, (v) => { actif = v; });
  qsa('[data-goutte]').forEach((b) => {
    b.addEventListener('pointerenter', () => { cadence = 4; });
    b.addEventListener('pointerleave', () => { cadence = 1.1; });
  });

  gsap.ticker.add((t, dtMs) => {
    if (!actif) return;
    const dt = Math.min(dtMs, 50) / 1000;
    attente -= dt;
    if (attente <= 0) {
      attente = 1 / cadence * (0.6 + Math.random() * 0.8);
      gouttes.push({ x: source.x * W + (Math.random() - 0.5) * 6, y: source.y * H, vy: 0, l: 6 + Math.random() * 6 });
    }
    ctx.clearRect(0, 0, W, H);
    for (let i = gouttes.length - 1; i >= 0; i--) {
      const g = gouttes[i];
      g.vy += 1600 * dt; g.y += g.vy * dt;
      const len = g.l + g.vy * 0.012;
      const grad = ctx.createLinearGradient(g.x, g.y - len, g.x, g.y);
      grad.addColorStop(0, 'rgba(141,187,255,0)');
      grad.addColorStop(1, 'rgba(200,225,255,.9)');
      ctx.strokeStyle = grad; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(g.x, g.y - len); ctx.lineTo(g.x, g.y); ctx.stroke();
      if (g.y > H - 4) {
        gouttes.splice(i, 1);
        for (let k = 0; k < 2; k++) eclats.push({ x: g.x, y: H - 4, r: 2, a: 0.7, v: 70 + k * 50 });
      }
    }
    for (let i = eclats.length - 1; i >= 0; i--) {
      const e = eclats[i];
      e.r += e.v * dt; e.a -= dt * 0.9;
      if (e.a <= 0) { eclats.splice(i, 1); continue; }
      ctx.strokeStyle = `rgba(200,225,255,${e.a.toFixed(3)})`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(e.x, e.y, e.r, e.r * 0.28, 0, 0, Math.PI * 2); ctx.stroke();
    }
  });
}
