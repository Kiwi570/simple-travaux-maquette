/* Page Prestations : le collecteur (une vanne par métier), le diagnostic par symptôme,
   le catalogue filtrable, et l'estimation partagée avec l'estimateur. */
import { env, gsap, ScrollTrigger, qs, qsa } from './env.js?v=3';
import { PIECES, euros } from '../data/tarifs.js?v=3';
import { SYMPTOMES, FAMILLE_DE_GROUPE } from '../data/metiers.js?v=3';
import { compteurDe } from './compteur.js?v=3';

const CLE = 'st-estimation';
const PLAT = [];
for (const p of PIECES) for (const g of p.groupes) for (const it of g.items) PLAT.push({ ...it, piece: p.id, court: p.court, groupe: g.titre, famille: FAMILLE_DE_GROUPE[g.titre] || 'remplacer' });
const PAR_ID = new Map(PLAT.map((x) => [x.id, x]));
const normaliser = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const prixTxt = (it) => (it.prix == null ? 'Sur devis' : euros(it.prix));

let rafraichir = 0;
const recalculer = () => { clearTimeout(rafraichir); rafraichir = setTimeout(() => { if (ScrollTrigger) ScrollTrigger.refresh(); }, 160); };

/* ---------- estimation partagée (même clé que l'estimateur) ---------- */
const choix = new Set();
const abonnes = [];
function lirePanier() {
  try { (JSON.parse(localStorage.getItem(CLE) || '[]')).forEach((id) => { if (PAR_ID.has(id)) choix.add(id); }); } catch (e) { /* rien */ }
}
function ecrirePanier() { try { localStorage.setItem(CLE, JSON.stringify([...choix])); } catch (e) { /* rien */ } }
function majPanier() { abonnes.forEach((f) => f()); }
function basculer(id, source) {
  const on = !choix.has(id);
  if (on) choix.add(id); else choix.delete(id);
  ecrirePanier();
  majPanier();
  if (on && source && env.anim) goutte(source, cibleGoutte());
}
function cibleGoutte() {
  const p = qs('[data-panier]');
  if (p && !p.hidden && p.getBoundingClientRect().width) return p;
  return qs('[data-barre-estim]');
}

/* une goutte saute d'un élément à un autre */
function goutte(source, cible) {
  if (!source || !cible || !gsap) return;
  const a = source.getBoundingClientRect(), b = cible.getBoundingClientRect();
  if (!b.width) return;
  const g = document.createElement('span');
  g.className = 'giclee'; g.setAttribute('aria-hidden', 'true');
  Object.assign(g.style, { width: '12px', height: '16px', boxShadow: '0 0 0 2px rgba(255,255,255,.7)' });
  document.body.appendChild(g);
  const x0 = a.left + a.width / 2 - 6, y0 = a.top + a.height / 2 - 8, x1 = b.left + b.width / 2 - 6, y1 = b.top + b.height / 2 - 8;
  gsap.timeline({ onComplete: () => g.remove() })
    .fromTo(g, { x: x0, scale: 0.4 }, { x: x1, scale: 1, duration: 0.7, ease: 'power1.inOut' }, 0)
    .fromTo(g, { y: y0 }, { y: Math.min(y0, y1) - 90, duration: 0.32, ease: 'power2.out' }, 0)
    .to(g, { y: y1, duration: 0.38, ease: 'power2.in' }, 0.32)
    .to(g, { scale: 0, opacity: 0, duration: 0.15 }, 0.66);
}

function initPanier() {
  lirePanier();
  const pastille = qs('[data-panier]');
  const total = qs('[data-panier-total]');
  const n = qs('[data-panier-n]');
  const barre = qs('[data-barre-estim-texte]');
  abonnes.push(() => {
    const t = [...choix].reduce((s, id) => s + (PAR_ID.get(id)?.prix || 0), 0);
    const k = choix.size;
    if (pastille) {
      const etait = !pastille.hidden;
      pastille.hidden = k === 0;
      if (total) total.textContent = euros(t);
      if (n) n.textContent = String(k);
      pastille.setAttribute('aria-label', `Mon estimation : ${k} prestation${k > 1 ? 's' : ''}, ${euros(t)} TTC. Finaliser dans l’estimateur`);
      if (!etait && k && env.anim) gsap.fromTo(pastille, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.8)' });
    }
    if (barre) barre.textContent = k ? `Mon estimation · ${euros(t)}` : 'Estimer mon prix';
    qsa('[data-ajout]').forEach((b) => {
      const on = choix.has(b.dataset.ajout);
      b.setAttribute('aria-pressed', String(on));
      const it = PAR_ID.get(b.dataset.ajout);
      const lib = qs('.visuellement-cache', b);
      if (lib && it) lib.textContent = on ? `Retirer ${it.nom} de mon estimation` : `Ajouter ${it.nom} à mon estimation`;
      b.closest('li')?.classList.toggle('ajoutee', on);
    });
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-ajout]');
    if (!b) return;
    basculer(b.dataset.ajout, b);
  });
  // une autre page (l'estimateur dans un autre onglet) a modifié la sélection
  window.addEventListener('storage', (e) => { if (e.key === CLE) { choix.clear(); lirePanier(); majPanier(); } });
  majPanier();
}

/* ---------- le collecteur ---------- */
function initCollecteur(intro) {
  const racine = qs('[data-collecteur]');
  if (!racine) return null;
  const boutons = qsa('.piquage', racine);
  const fiches = qsa('[data-fiche]');
  const eau = qs('[data-collecteur-eau]', racine);
  const barre = qs('.collecteur__barre', racine);
  const mano = qs('[data-collecteur-mano]');
  const aiguille = qs('[data-mano-aiguille]');
  const lecture = qs('[data-mano-valeur]');
  const vertical = () => window.matchMedia('(max-width: 759px)').matches;
  const angle = (n) => -135 + (Math.min(70, n) / 70) * 270;
  let actif = null;
  const etatLecture = { v: Number(lecture?.textContent || 0) };

  const remplir = () => {
    if (!actif || !eau || !barre) return;
    const t = qs('.piquage__tube', actif).getBoundingClientRect(), r = barre.getBoundingClientRect();
    if (vertical()) { eau.style.width = ''; eau.style.height = `${Math.max(0, t.top + t.height / 2 - r.top - 4)}px`; }
    else { eau.style.height = ''; eau.style.width = `${Math.max(0, t.left + t.width / 2 - r.left - 4)}px`; }
  };

  function giclee(btn) {
    const v = qs('.piquage__vanne', btn).getBoundingClientRect();
    const cx = v.left + v.width / 2, cy = v.top + v.height / 2;
    for (let i = 0; i < 9; i++) {
      const g = document.createElement('span');
      g.className = 'giclee'; g.setAttribute('aria-hidden', 'true');
      document.body.appendChild(g);
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const d = 30 + Math.random() * 34;
      gsap.timeline({ onComplete: () => g.remove() })
        .fromTo(g, { x: cx - 3, y: cy - 4, scale: 0.6, opacity: 1 }, { x: cx - 3 + Math.cos(a) * d, duration: 0.7, ease: 'power1.out' }, 0)
        .to(g, { y: cy - 4 + Math.sin(a) * d * 0.8, duration: 0.3, ease: 'power2.out' }, 0)
        .to(g, { y: cy + 30 + Math.random() * 24, duration: 0.4, ease: 'power2.in' }, 0.3)
        .to(g, { opacity: 0, duration: 0.2 }, 0.52);
    }
  }

  function montrerFiche(id) {
    fiches.forEach((f) => {
      const on = f.dataset.fiche === id;
      f.hidden = !on;
      if (!on) return;
      const c = compteurDe(qs('[data-compteur]', f));
      if (c) { const v = Number(qs('[data-compteur]', f).dataset.valeur); c.set(0, { instant: true }); c.set(v); }
      if (env.anim) {
        const img = qs('.fiche__visuel img', f);
        gsap.fromTo(img, { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.06 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.9, ease: 'expo.out' });
        gsap.fromTo(qsa('.fiche__texte > *, .fiche__vedettes li', f), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.04, ease: 'power3.out' });
      }
    });
    recalculer();
  }

  function ouvrir(btn, { focus = false, auto = false } = {}) {
    if (!btn || btn === actif) return;
    actif = btn;
    boutons.forEach((b) => { const on = b === btn; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
    if (focus) btn.focus();
    const n = Number(btn.dataset.n);
    remplir();
    if (aiguille && gsap) {
      if (env.anim) gsap.to(aiguille, { rotation: angle(n), svgOrigin: '70 70', duration: 1.5, ease: 'elastic.out(1, 0.42)' });
      else gsap.set(aiguille, { rotation: angle(n), svgOrigin: '70 70' });
    }
    if (lecture) {
      if (env.anim && gsap) gsap.to(etatLecture, { v: n, duration: 0.9, ease: 'power2.out', onUpdate: () => { lecture.textContent = String(Math.round(etatLecture.v)); } });
      else lecture.textContent = String(n);
    }
    montrerFiche(btn.dataset.metier);
    if (!auto && env.anim) giclee(btn);
  }

  boutons.forEach((b, i) => {
    b.addEventListener('click', () => ouvrir(b));
    b.addEventListener('keydown', (e) => {
      const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      let j = null;
      if (k) j = (i + k + boutons.length) % boutons.length;
      if (e.key === 'Home') j = 0;
      if (e.key === 'End') j = boutons.length - 1;
      if (j !== null) { e.preventDefault(); ouvrir(boutons[j], { focus: true }); }
    });
  });
  window.addEventListener('resize', () => { clearTimeout(racine.__r); racine.__r = setTimeout(remplir, 120); });

  if (!env.anim || !gsap) {
    ouvrir(boutons[0], { auto: true });
    return { ouvrir };
  }
  // ouverture : la rampe se pose, les vannes arrivent, puis la première s'ouvre seule
  boutons.forEach((b) => b.setAttribute('aria-selected', 'false'));
  if (aiguille) gsap.set(aiguille, { rotation: -135, svgOrigin: '70 70' });
  if (lecture) lecture.textContent = '0';
  etatLecture.v = 0;
  gsap.set(barre, { [vertical() ? 'scaleY' : 'scaleX']: 0 });
  gsap.set(qsa('.piquage', racine), { opacity: 0, y: -14 });
  if (mano) gsap.set(mano, { opacity: 0, y: 10 });
  intro.then(() => {
    const tl = gsap.timeline({ delay: 0.25 });
    tl.fromTo(barre, { [vertical() ? 'scaleY' : 'scaleX']: 0 }, { [vertical() ? 'scaleY' : 'scaleX']: 1, duration: 1, ease: 'power3.inOut' }, 0)
      .fromTo(mano, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.3)
      .fromTo(qsa('.piquage', racine), { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: 'back.out(2)' }, 0.55)
      .call(() => ouvrir(boutons[0], { auto: true }), null, 1.35)
      .call(() => giclee(boutons[0]), null, 1.45);
  });
  return { ouvrir };
}

/* ---------- le diagnostic ---------- */
function initDiagnostic() {
  const racine = qs('#diagnostic');
  if (!racine) return;
  const btns = qsa('[data-symptome]', racine);
  const liste = qs('[data-diag-liste]', racine);
  const resume = qs('[data-diag-resume]', racine);
  const plus = qs('[data-diag-plus]', racine);
  const visuel = qs('[data-diag-visuel]', racine);
  const img = qs('img', visuel);
  const tampon = qs('[data-diag-tampon]', racine);
  const MAX = 6;
  const modele = qs('.cat-ajout--devis');
  const TEL = { href: modele ? modele.getAttribute('href') : 'tel:', ico: modele ? modele.innerHTML : '' };
  let courant = SYMPTOMES[0], tout = false;

  const ligne = (it) => {
    const li = document.createElement('li');
    const nom = document.createElement('span'); nom.className = 'diag__nom';
    const small = document.createElement('small'); small.textContent = it.court;
    const b = document.createElement('b'); b.textContent = it.nom;
    nom.append(small, b);
    const prix = document.createElement('span'); prix.className = 'diag__prix'; prix.textContent = prixTxt(it);
    li.append(nom, prix);
    if (it.prix == null) {
      const d = document.createElement('a'); d.className = 'cat-ajout cat-ajout--devis'; d.href = TEL.href;
      d.setAttribute('aria-label', `Appeler Pedro pour un devis : ${it.nom}`); d.innerHTML = TEL.ico; li.append(d);
    } else {
      const a = document.createElement('button');
      a.type = 'button'; a.className = 'cat-ajout'; a.dataset.ajout = it.id; a.setAttribute('aria-pressed', 'false');
      a.innerHTML = '<span class="visuellement-cache"></span><span class="cat-ajout__ico" aria-hidden="true"></span>';
      li.append(a);
    }
    return li;
  };

  function rendre(anim) {
    const items = PLAT.filter(courant.test).sort((a, b) => (a.prix ?? 1e9) - (b.prix ?? 1e9));
    const prix = items.filter((i) => i.prix != null).map((i) => i.prix);
    const devis = items.some((i) => i.prix == null);
    resume.textContent = '';
    resume.append(document.createTextNode(`${courant.nom} : ${items.length} intervention${items.length > 1 ? 's' : ''}`));
    const detail = document.createElement('span'); detail.className = 'mono';
    detail.textContent = prix.length ? `de ${euros(Math.min(...prix))} à ${euros(Math.max(...prix))} TTC${devis ? ' · une sur devis' : ''}` : 'sur devis';
    resume.append(detail);
    liste.textContent = '';
    items.slice(0, tout ? items.length : MAX).forEach((it) => liste.appendChild(ligne(it)));
    plus.hidden = items.length <= MAX;
    plus.textContent = tout ? 'Réduire la liste' : `Voir les ${items.length} interventions`;
    majPanier();
    if (anim && env.anim) gsap.fromTo(liste.children, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.035, ease: 'power3.out' });
    recalculer();
  }

  function changerImage(btn) {
    const src = btn.dataset.src, srcset = btn.dataset.srcset, alt = btn.dataset.alt;
    if (!img || img.getAttribute('src') === src) return;
    const poser = () => {
      const pret = new Image(); pret.srcset = srcset; pret.sizes = img.sizes; pret.src = src;
      const fini = () => {
        img.srcset = srcset; img.src = src; img.alt = alt;
        if (env.anim) gsap.fromTo(img, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'expo.out' });
      };
      (pret.decode ? pret.decode() : Promise.resolve()).then(fini, fini);
    };
    if (env.anim) gsap.to(img, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.3, ease: 'power2.in', onComplete: poser });
    else poser();
  }

  btns.forEach((btn) => btn.addEventListener('click', () => {
    const s = SYMPTOMES.find((x) => x.id === btn.dataset.symptome);
    if (!s || s === courant) return;
    courant = s; tout = false;
    btns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    if (tampon) {
      tampon.textContent = s.nom;
      if (env.anim) gsap.fromTo(tampon, { scale: 1.4, rotation: -8, opacity: 0 }, { scale: 1, rotation: -3, opacity: 1, duration: 0.5, ease: 'back.out(2.2)' });
    }
    changerImage(btn);
    if (env.anim) goutte(qs('.picto', btn), resume);
    rendre(true);
  }));
  plus.addEventListener('click', () => { tout = !tout; rendre(true); });
  rendre(false);
}

/* ---------- le catalogue ---------- */
function initCatalogue() {
  const racine = qs('#catalogue');
  if (!racine) return null;
  const vannes = qsa('[data-cat-filtre]', racine);
  const champ = qs('[data-cat-recherche]', racine);
  const compte = qs('[data-cat-compte]', racine);
  const compteInitial = compte.textContent;
  const vide = qs('[data-cat-vide]', racine);
  const familles = qsa('[data-famille]', racine);
  const actives = new Set(vannes.map((v) => v.dataset.catFiltre));
  const deplies = new Set();
  const PLI = 4;
  let attente = 0;

  function appliquer(anim) {
    const mots = normaliser(champ.value.trim()).split(/\s+/).filter(Boolean);
    const filtre = mots.length > 0 || actives.size < vannes.length;
    let total = 0;
    const nouvelles = [];
    familles.forEach((f) => {
      const id = f.dataset.famille;
      let n = 0, caches = 0;
      qsa('.cat-lignes', f).forEach((ul) => {
        let k = 0;
        qsa('.cat-ligne', ul).forEach((l) => {
          const ok = actives.has(l.dataset.cat) && mots.every((m) => l.dataset.texte.includes(m));
          if (ok) { n++; k++; }
          const montrer = ok && (filtre || deplies.has(id) || k <= PLI);
          if (ok && !montrer) caches++;
          if (montrer && l.hidden) nouvelles.push(l);
          l.hidden = !montrer;
        });
      });
      qsa('.famille__piece', f).forEach((p) => { p.hidden = !qsa('.cat-ligne', p).some((l) => !l.hidden); });
      f.hidden = n === 0;
      const plusBtn = qs('[data-famille-plus]', f);
      const replier = deplies.has(id) && !filtre && n > PLI;
      plusBtn.hidden = !caches && !replier;
      plusBtn.textContent = replier ? 'Réduire la liste' : `Voir les ${caches} autres prestations`;
      total += n;
    });
    compte.textContent = filtre ? `${total} prestation${total > 1 ? 's' : ''} trouvée${total > 1 ? 's' : ''}` : compteInitial;
    vide.hidden = total > 0;
    if (anim && env.anim && nouvelles.length) gsap.fromTo(nouvelles.slice(0, 40), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.015, ease: 'power3.out' });
    recalculer();
  }

  vannes.forEach((v) => v.addEventListener('click', () => {
    const id = v.dataset.catFiltre;
    if (actives.has(id) && actives.size === 1) {
      if (env.anim) gsap.fromTo(v, { x: -4 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, .3)' });
      return;
    }
    if (actives.has(id)) actives.delete(id); else actives.add(id);
    v.setAttribute('aria-pressed', String(actives.has(id)));
    appliquer(true);
  }));
  champ.addEventListener('input', () => { clearTimeout(attente); attente = setTimeout(() => appliquer(true), 140); });
  champ.addEventListener('keydown', (e) => { if (e.key === 'Escape') { champ.value = ''; appliquer(true); } });
  familles.forEach((f) => qs('[data-famille-plus]', f).addEventListener('click', () => {
    const id = f.dataset.famille;
    if (deplies.has(id)) deplies.delete(id); else deplies.add(id);
    appliquer(true);
  }));

  // en-têtes de famille : image révélée, raccord tracé
  if (env.anim && ScrollTrigger) {
    familles.forEach((f) => {
      const im = qs('.famille__img img', f);
      gsap.set(im, { clipPath: 'inset(0% 0% 100% 0%)' });
      ScrollTrigger.create({ trigger: f, start: 'top 86%', once: true, onEnter: () => gsap.fromTo(im, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' }) });
    });
  }
  appliquer(false);
  return {
    deplier(id) {
      champ.value = '';
      vannes.forEach((v) => { actives.add(v.dataset.catFiltre); v.setAttribute('aria-pressed', 'true'); });
      deplies.add(id);
      appliquer(false);
    },
  };
}

export function initPrestations(intro) {
  if (!qs('[data-collecteur]') && !qs('[data-ajout]')) return;
  initPanier();
  initCollecteur(intro);
  initDiagnostic();
  const catalogue = initCatalogue();
  // « Voir les N tarifs » : la famille se déplie avant le défilement
  qsa('[data-ouvrir-famille]').forEach((a) => a.addEventListener('click', () => catalogue && catalogue.deplier(a.dataset.ouvrirFamille)));
}
