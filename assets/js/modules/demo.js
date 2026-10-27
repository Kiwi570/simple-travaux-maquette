/* Accueil, « Le prix avant les travaux » : le compteur roule jusqu'au tarif choisi. */
import { env, qs, qsa, surVisibilite } from './env.js?v=2';
import { compteurDe } from './compteur.js?v=2';
import { PRESTATIONS } from '../data/tarifs.js?v=2';

export function initDemo() {
  const zone = qs('[data-demo]');
  if (!zone) return;
  const c = compteurDe(qs('[data-compteur]', zone));
  const ligne = qs('[data-demo-ligne]', zone);
  const btns = qsa('[data-demo-btn]', zone);
  let idx = 0, auto = true, minuterie = null, visible = false, premier = true;

  const choisir = (i) => {
    idx = i;
    const b = btns[i];
    const it = PRESTATIONS.get(b.dataset.demoBtn);
    btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    if (ligne && it) ligne.textContent = `${it.nom} — ${it.pieceNom}`;
    if (c) c.set(Number(b.dataset.demoPrix));
  };
  btns.forEach((b, i) => b.addEventListener('click', () => { auto = false; clearInterval(minuterie); choisir(i); }));

  surVisibilite(zone, (v) => {
    visible = v;
    if (v && premier && c) { premier = false; c.set(0, { instant: true }); choisir(0); }
    clearInterval(minuterie);
    if (v && auto && env.anim) minuterie = setInterval(() => { if (visible && auto) choisir((idx + 1) % btns.length); }, 3400);
  });
}
