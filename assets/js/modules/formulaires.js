/* Formulaires simulés : demande d'intervention, rendez-vous, message.
   Rien n'est envoyé : une confirmation récapitule la demande. */
import { env, gsap, qs, qsa } from './env.js?v=1';
import { SITE } from '../data/site.js?v=1';
import { euros } from '../data/tarifs.js?v=1';

const CRENEAUX = ['8h – 10h', '10h – 12h', '14h – 16h', '16h – 19h'];
const JOURS_COURTS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const fmtJour = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtMois = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });

function joursOuvres(depart, n) {
  const out = [];
  const d = new Date(depart);
  while (out.length < n) {
    if (SITE.horaires.jours.includes(d.getDay())) out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function bouton(cls, html, attrs = {}) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = cls; b.setAttribute('aria-pressed', 'false');
  b.innerHTML = html;
  Object.entries(attrs).forEach(([k, v]) => b.setAttribute(k, v));
  return b;
}

function selectionUnique(conteneur, onChange) {
  conteneur.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || b.disabled || !conteneur.contains(b)) return;
    qsa('button', conteneur).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    onChange && onChange(b);
  });
}

function heures(form) {
  const h = qs('[data-heures]', form);
  if (!h) return;
  h.textContent = '';
  CRENEAUX.forEach((c) => h.appendChild(bouton('heure', c, { 'data-heure': c })));
  selectionUnique(h);
}

function jourChoisi(form) { const b = qs('[data-jour][aria-pressed="true"]', form); return b ? b.dataset.jour : null; }
function heureChoisie(form) { const b = qs('[data-heure][aria-pressed="true"]', form); return b ? b.dataset.heure : null; }

/* Demande (estimateur) : douze jours ouvrés à partir de demain */
function initDemande(form) {
  const jours = qs('[data-jours]', form);
  const demain = new Date(); demain.setHours(12, 0, 0, 0); demain.setDate(demain.getDate() + 1);
  joursOuvres(demain, 12).forEach((d) => {
    jours.appendChild(bouton('jour', `<small>${JOURS_COURTS[d.getDay()]}</small>${d.getDate()}/${String(d.getMonth() + 1).padStart(2, '0')}`, { 'data-jour': fmtJour.format(d) }));
  });
  selectionUnique(jours);
  heures(form);
  const creneaux = qs('[data-creneaux]', form);
  const maj = () => { creneaux.hidden = (qs('input[name="quand"]:checked', form) || {}).value !== 'rdv'; };
  qsa('input[name="quand"]', form).forEach((r) => r.addEventListener('change', maj));
  maj();
}

/* Rendez-vous (contact) : calendrier de trois semaines, du lundi au samedi */
function initCalendrier(form) {
  const grille = qs('[data-cal-grille]', form);
  const mois = qs('[data-cal-mois]', form);
  const prec = qs('[data-cal-prec]', form), suiv = qs('[data-cal-suiv]', form);
  let page = 0;
  const lundi = new Date(); lundi.setHours(12, 0, 0, 0);
  lundi.setDate(lundi.getDate() - ((lundi.getDay() + 6) % 7));
  const demain = new Date(); demain.setHours(0, 0, 0, 0); demain.setDate(demain.getDate() + 1);

  const dessiner = () => {
    grille.textContent = '';
    ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'].forEach((j) => { const s = document.createElement('span'); s.className = 'calendrier__entete'; s.textContent = j; s.setAttribute('aria-hidden', 'true'); grille.appendChild(s); });
    const debut = new Date(lundi); debut.setDate(debut.getDate() + page * 21);
    const fin = new Date(debut); fin.setDate(fin.getDate() + 20);
    mois.textContent = debut.getMonth() === fin.getMonth() ? fmtMois.format(debut) : `${fmtMois.format(debut).split(' ')[0]} – ${fmtMois.format(fin)}`;
    for (let s = 0; s < 3; s++) {
      for (let j = 0; j < 6; j++) {
        const d = new Date(debut); d.setDate(debut.getDate() + s * 7 + j);
        const b = bouton('jour', `<small>${JOURS_COURTS[d.getDay()]}</small>${d.getDate()}`, { 'data-jour': fmtJour.format(d), 'aria-label': fmtJour.format(d) });
        if (d < demain) b.disabled = true;
        grille.appendChild(b);
      }
    }
    prec.disabled = page === 0; suiv.disabled = page >= 2;
    if (env.anim && gsap) gsap.fromTo(qsa('.jour', grille), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.012 });
  };
  prec.addEventListener('click', () => { page = Math.max(0, page - 1); dessiner(); });
  suiv.addEventListener('click', () => { page = Math.min(2, page + 1); dessiner(); });
  selectionUnique(grille);
  dessiner();
  heures(form);
}

function erreur(champ, msg) {
  const c = champ.closest('.champ') || champ.closest('fieldset') || champ;
  c.classList.add('erreur');
  champ.setAttribute && champ.setAttribute('aria-invalid', 'true');
  let m = c.querySelector('.champ__erreur');
  if (!m) { m = document.createElement('span'); m.className = 'champ__erreur petit'; m.style.color = 'var(--eau-chaude)'; c.appendChild(m); }
  m.textContent = msg;
}

function nettoyer(form) {
  qsa('.erreur', form).forEach((c) => c.classList.remove('erreur'));
  qsa('[aria-invalid]', form).forEach((c) => c.removeAttribute('aria-invalid'));
  qsa('.champ__erreur', form).forEach((m) => m.remove());
}

function valider(form, type) {
  nettoyer(form);
  const pb = [];
  qsa('input[required], textarea[required]', form).forEach((i) => {
    if (i.type === 'radio') return;
    if (!i.value.trim()) pb.push([i, 'Champ obligatoire']);
    else if (i.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim())) pb.push([i, 'Adresse e-mail incomplète']);
    else if (i.type === 'tel' && i.value.replace(/\D/g, '').length < 10) pb.push([i, 'Numéro à 10 chiffres']);
  });
  if ((type === 'rdv' || type === 'message') && !qs('input[name="type"]:checked', form)) pb.push([qs('.types', form), 'Choisissez au moins un type']);
  const quand = (qs('input[name="quand"]:checked', form) || {}).value;
  if (type === 'rdv' || (type === 'demande' && quand === 'rdv')) {
    if (!jourChoisi(form)) pb.push([qs('[data-jours], [data-cal-grille]', form), 'Choisissez un jour']);
    if (!heureChoisie(form)) pb.push([qs('[data-heures]', form), 'Choisissez un créneau']);
  }
  pb.forEach(([el, m]) => erreur(el, m));
  if (pb.length) { const f = pb[0][0]; (f.focus ? f : qs('button', f))?.focus(); }
  return pb.length === 0;
}

function confirmer(form, type) {
  const conf = qs('[data-confirmation]', form);
  const v = (n) => (form.elements[n] ? form.elements[n].value.trim() : '');
  const p = [];
  const ajout = (fort, txt) => { const e = document.createElement('p'); if (fort) { const b = document.createElement('b'); b.textContent = fort; e.appendChild(b); e.appendChild(document.createTextNode(' ')); } e.appendChild(document.createTextNode(txt)); p.push(e); };
  ajout('Demande simulée.', 'Rien n’a été envoyé : c’est une maquette.');
  if (type === 'demande') {
    const s = window.__stEstimation ? window.__stEstimation() : { items: [], total: 0 };
    ajout('Sélection :', s.items.length ? `${s.items.length} prestation${s.items.length > 1 ? 's' : ''}, ${euros(s.total)} TTC.` : 'aucune prestation cochée.');
    const quand = (qs('input[name="quand"]:checked', form) || {}).value;
    ajout('Quand :', quand === 'urgent' ? 'urgent, rappel au plus vite.' : quand === 'rdv' ? `${jourChoisi(form)}, ${heureChoisie(form)}.` : 'pas tout de suite.');
  }
  if (type === 'rdv') ajout('Rendez-vous :', `${jourChoisi(form)}, ${heureChoisie(form)} — ${qsa('input[name="type"]:checked', form).map((i) => i.value).join(', ')}.`);
  if (type === 'message') ajout('Type :', `${qsa('input[name="type"]:checked', form).map((i) => i.value).join(', ')}.`);
  ajout('Contact :', `${v('nom')}${v('prenom') ? ' ' + v('prenom') : ''}, ${v('tel')}.`);
  ajout('', 'Sur le site définitif, Pedro vous rappellerait pour confirmer.');
  conf.textContent = '';
  p.forEach((e) => conf.appendChild(e));
  conf.hidden = false;
  conf.focus();
  if (env.anim && gsap) gsap.fromTo(conf, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
}

export function initFormulaires() {
  qsa('[data-form-simule]').forEach((form) => {
    const type = form.dataset.formSimule;
    if (type === 'demande') initDemande(form);
    if (type === 'rdv') initCalendrier(form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (valider(form, type)) confirmer(form, type);
    });
    form.addEventListener('input', (e) => {
      const c = e.target.closest('.erreur');
      if (c) { c.classList.remove('erreur'); c.querySelector('.champ__erreur')?.remove(); e.target.removeAttribute('aria-invalid'); }
    });
  });
}
