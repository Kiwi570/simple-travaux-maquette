// Génère les pages HTML statiques de la maquette à partir des données.
// Usage : node tools/build.mjs  (depuis le dossier de la maquette)
import { writeFileSync, readFileSync } from 'node:fs';
import { PIECES, prixMin, nbTarifs, euros } from '../assets/js/data/tarifs.js';
import { SITE, CONDITIONS, COMMUNES, CENTRE, OISE, distanceKm } from '../assets/js/data/site.js';

const V = readFileSync(new URL('./version.txt', import.meta.url), 'utf8').trim();
const BASE = 'https://simple-travaux-maquette.vercel.app';
const IMG = JSON.parse(readFileSync(new URL('./images.json', import.meta.url), 'utf8'));
const v = (u) => `${u}?v=${V}`;
const TOTAL = PIECES.reduce((n, p) => n + nbTarifs(p), 0);

/* ---------- utilitaires ---------- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function img(name, alt, { sizes = '100vw', cls = '', eager = false, attrs = '', root = '' } = {}) {
  const m = IMG[name];
  if (!m) throw new Error('image inconnue ' + name);
  const srcset = m.sizes.map((w) => `${root}assets/img/${name}-${w}.webp ${w}w`).join(', ');
  const def = m.sizes[Math.min(1, m.sizes.length - 1)];
  const h = Math.round((m.h * def) / m.w);
  return `<img class="${cls}" src="${root}assets/img/${name}-${def}.webp" srcset="${srcset}" sizes="${sizes}" width="${def}" height="${h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" ${attrs}>`;
}

const ICONES = {
  fleche: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  tel: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5h2.6l1.4 4.2-1.9 1.4a12 12 0 0 0 6.2 6.2l1.4-1.9 4.2 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  sms: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  mail: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6h17v12h-17zM4 7l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  cal: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v14H4zM4 10h16M8 3v5M16 3v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
};

const vanne = '<span class="vanne" aria-hidden="true"><i></i></span>';
const eyebrow = (num, texte, clair = false) =>
  `<p class="eyebrow${clair ? ' eyebrow--clair' : ''}" data-raccord>${vanne}<span class="mono">${num}</span><span>${texte}</span></p>`;

/* ---------- gabarit commun ---------- */
function head({ titre, description, og, chemin, root = '' }) {
  return `<!doctype html>
<html lang="fr" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titre)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#F2EEE4">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Simple Travaux">
<meta property="og:title" content="${esc(titre)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${BASE}${chemin}">
<meta property="og:image" content="${BASE}/og/${og}.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(titre)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(titre)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${BASE}/og/${og}.jpg">
<link rel="icon" href="${root}favicon.svg" type="image/svg+xml">
<script>
(function(d){var h=d.documentElement;h.classList.remove('no-js');h.classList.add('js','charge');
var c=null;try{c=localStorage.getItem('st-calme')}catch(e){}
var r=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
if(c==='1'||(c===null&&r))h.classList.add('calme');
try{if(sessionStorage.getItem('st-calme-retour')&&'scrollRestoration' in history)history.scrollRestoration='manual';if(sessionStorage.getItem('st-vu'))h.classList.add('deja-vu');if(sessionStorage.getItem('st-transition')&&!h.classList.contains('calme'))h.classList.add('entree')}catch(e){}
setTimeout(function(){h.classList.remove('charge')},2500);})(document);
</script>
<link rel="preload" href="${root}assets/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${root}assets/fonts/instrument-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${root}assets/fonts/jetbrains-mono-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${root}${v('assets/css/style.css')}">
<link rel="modulepreload" href="${root}${v('assets/js/main.js')}">
</head>`;
}

const marque = (root = '') => `<a class="marque" href="${root}index.html" aria-label="Simple Travaux, accueil">
  <svg class="marque__picto" viewBox="0 0 40 40" aria-hidden="true"><path d="M4 14h32M20 14v22" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="square"/><path d="M4 14h32M20 14v22" fill="none" stroke="var(--eau-froide)" stroke-width="2" stroke-dasharray="3 5" class="marque__eau"/><rect x="1" y="8" width="6" height="12" rx="1" fill="currentColor"/><rect x="33" y="8" width="6" height="12" rx="1" fill="currentColor"/></svg>
  <span class="marque__mot"><b>SIMPLE</b><span>TRAVAUX</span></span>
</a>`;

function entete(page, root = '') {
  const lien = (href, label, id) => `<a class="nav__lien" href="${root}${href}"${page === id ? ' aria-current="page"' : ''}><span>${label}</span></a>`;
  return `<a class="evitement" href="#contenu">Aller au contenu</a>
<header class="entete" data-entete>
  <div class="entete__in">
    ${marque(root)}
    <nav class="nav" aria-label="Navigation principale">
      ${lien('index.html', 'Accueil', 'accueil')}
      ${lien('estimation.html', 'Estimer mon prix', 'estimation')}
      ${lien('contact.html', 'Contact', 'contact')}
    </nav>
    <div class="entete__actions">
      <span class="voyant" data-voyant><i></i><span data-voyant-texte>Lun–sam 8h–19h</span></span>
      <a class="btn btn--tel" href="${SITE.telHref}" data-magnet>${ICONES.tel}<span>${SITE.tel}</span></a>
      <button class="calme-btn" type="button" data-calme aria-pressed="false" title="Réduire les animations"><span class="calme-btn__ico" aria-hidden="true"></span><span class="calme-btn__long">Mode calme</span><span class="calme-btn__court">Calme</span></button>
      <button class="menu-btn" type="button" data-menu aria-expanded="false" aria-controls="menu"><span class="visuellement-cache">Menu</span><i></i><i></i></button>
    </div>
  </div>
</header>
<div class="menu" id="menu" data-menu-panneau hidden>
  <nav aria-label="Menu mobile">
    <a href="${root}index.html"${page === 'accueil' ? ' aria-current="page"' : ''}><span class="mono">01</span>Accueil</a>
    <a href="${root}estimation.html"${page === 'estimation' ? ' aria-current="page"' : ''}><span class="mono">02</span>Estimer mon prix</a>
    <a href="${root}contact.html"${page === 'contact' ? ' aria-current="page"' : ''}><span class="mono">03</span>Contact</a>
  </nav>
  <a class="menu__tel" href="${SITE.telHref}">${ICONES.tel}${SITE.tel}</a>
  <p class="mono menu__horaires">Du lundi au samedi, 8h–19h</p>
</div>`;
}

const ouverture = `<div class="ouverture" data-ouverture aria-hidden="true">
  <div class="ouverture__feuille ouverture__feuille--haut"></div>
  <div class="ouverture__feuille ouverture__feuille--bas"></div>
  <div class="ouverture__centre">
    <svg class="ouverture__tuyau" viewBox="0 0 1000 120" preserveAspectRatio="none">
      <path class="ouverture__cuivre" d="M0 96 H180 Q200 96 200 76 V44 Q200 24 220 24 H780 Q800 24 800 44 V76 Q800 96 820 96 H1000"/>
      <path class="ouverture__eau" d="M0 96 H180 Q200 96 200 76 V44 Q200 24 220 24 H780 Q800 24 800 44 V76 Q800 96 820 96 H1000"/>
    </svg>
    <p class="ouverture__mot"><span class="ouverture__l1">SIMPLE</span><span class="ouverture__l2">TRAVAUX</span></p>
    <p class="ouverture__sous mono">Plomberie · Chauffage · Électricité — Oise (60)</p>
  </div>
</div>`;

const transitionEau = `<div class="vidange" data-vidange aria-hidden="true"><svg class="vidange__vague" viewBox="0 0 1200 60" preserveAspectRatio="none"><path d="M0 30 Q150 0 300 30 T600 30 T900 30 T1200 30 V60 H0Z"/></svg><div class="vidange__eau"></div></div>
<div class="curseur" data-curseur aria-hidden="true"><span class="curseur__h"></span><span class="curseur__v"></span><span class="curseur__rond"></span><span class="curseur__coord mono" data-curseur-coord></span><span class="curseur__label mono" data-curseur-label></span></div>
<canvas class="gl-ondes" data-gl-ondes aria-hidden="true"></canvas>
<svg class="reseau" data-reseau aria-hidden="true"></svg>`;

function barre(page, root = '') {
  if (page === 'estimation') {
    return `<nav class="barre barre--estim" data-barre aria-label="Actions rapides">
  <a class="barre__btn barre__btn--tel" href="${SITE.telHref}">${ICONES.tel}<span>Appeler</span></a>
  <button class="barre__btn barre__btn--total" type="button" data-recap-ouvrir aria-controls="recap"><span class="mono">Total</span><b data-barre-total>0 €</b><span class="barre__voir">Récap</span></button>
</nav>`;
  }
  return `<nav class="barre" data-barre aria-label="Actions rapides">
  <a class="barre__btn barre__btn--tel" href="${SITE.telHref}">${ICONES.tel}<span>Appeler</span></a>
  <a class="barre__btn barre__btn--cuivre" href="${root}estimation.html">Estimer mon prix ${ICONES.fleche}</a>
</nav>`;
}

function pied(root = '') {
  return `<footer class="pied sombre" data-masque-barre>
  <div class="wrap pied__grille">
    <div class="pied__marque">
      ${marque(root)}
      <p>Artisan plombier, chauffagiste et électricien indépendant à ${SITE.ville} (${SITE.cp}). Intervention dans un rayon de ${SITE.rayonKm} km.</p>
    </div>
    <div>
      <p class="pied__titre mono">Contact</p>
      <ul class="pied__liste">
        <li><a href="${SITE.telHref}">${SITE.tel}</a> <span class="pied__note">appel ou SMS</span></li>
        <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
        <li>${SITE.ville} (${SITE.cp}), Oise</li>
      </ul>
    </div>
    <div>
      <p class="pied__titre mono">Horaires</p>
      <ul class="pied__liste">
        <li>Du lundi au samedi, 8h–19h</li>
        <li>Urgences : prise en charge selon disponibilité</li>
        <li><span class="voyant voyant--clair" data-voyant><i></i><span data-voyant-texte>Lun–sam 8h–19h</span></span></li>
      </ul>
    </div>
    <div>
      <p class="pied__titre mono">Pages</p>
      <ul class="pied__liste">
        <li><a href="${root}index.html">Accueil</a></li>
        <li><a href="${root}estimation.html">Estimer mon prix</a></li>
        <li><a href="${root}contact.html">Contact et rendez-vous</a></li>
        <li><a href="${root}mentions-legales.html">Mentions légales et confidentialité</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap pied__bas mono">
    <span>© 2026 Simple Travaux</span>
    <span>Maquette de démonstration, non indexée. Formulaires et rendez-vous simulés.</span>
  </div>
</footer>`;
}

function scripts(root = '') {
  return `<script src="${root}assets/vendor/gsap/gsap.min.js" defer></script>
<script src="${root}assets/vendor/gsap/ScrollTrigger.min.js" defer></script>
<script src="${root}assets/vendor/gsap/SplitText.min.js" defer></script>
<script src="${root}assets/vendor/gsap/DrawSVGPlugin.min.js" defer></script>
<script src="${root}assets/vendor/lenis/lenis.min.js" defer></script>
<script type="module" src="${root}${v('assets/js/main.js')}"></script>`;
}

function page({ id, titre, description, og, chemin, contenu, root = '' }) {
  return `${head({ titre, description, og, chemin, root })}
<body data-page="${id}">
${ouverture}
${entete(id, root)}
<main id="contenu">
${contenu}
</main>
${pied(root)}
${barre(id, root)}
${transitionEau}
${scripts(root)}
</body>
</html>
`;
}

/* ---------- la maison en coupe ---------- */
const HOTSPOTS = [
  { piece: 'baignoire', label: 'Baignoire', x: 168, y: 276, dir: 'n' },
  { piece: 'douche', label: 'Douche', x: 298, y: 218, dir: 'n' },
  { piece: 'lavabo', label: 'Lavabo', x: 400, y: 262, dir: 'n' },
  { piece: 'radiateurs', label: 'Radiateur', x: 580, y: 266, dir: 'n' },
  { piece: 'electricite', label: 'Tableau', x: 458, y: 400, dir: 'w' },
  { piece: 'chauffe-eau', label: 'Chauffe-eau', x: 610, y: 376, dir: 'n' },
  { piece: 'cuisine', label: 'Évier', x: 180, y: 456, dir: 'n' },
  { piece: 'wc', label: 'WC', x: 356, y: 462, dir: 's' },
  { piece: 'depannage', label: 'Compteur', x: 668, y: 524, dir: 's' },
];

const TOUS = new Map(); for (const p of PIECES) for (const g of p.groupes) for (const it of g.items) TOUS.set(it.id, it);
/* trois tarifs réels par point de la coupe, affichés au survol */
const FICHES = {
  baignoire: [['bai-debouchage', 'Débouchage'], ['bai-robinet', 'Robinet ou mitigeur'], ['bai-170', 'Baignoire 170 cm']],
  douche: [['dou-joints', 'Joints silicone'], ['dou-mitigeur', 'Mitigeur'], ['dou-bac-90', 'Receveur 90 × 90']],
  lavabo: [['lav-siphon', 'Siphon'], ['lav-robinet', 'Robinet'], ['lav-meuble', 'Meuble vasque']],
  radiateurs: [['rad-chauffe-mal', 'Radiateur qui chauffe mal'], ['rad-robinet', 'Robinet de radiateur'], ['rad-remplacement', 'Remplacement']],
  electricite: [['el-prise', 'Prise ou interrupteur'], ['el-panne', 'Recherche de panne'], ['el-tableau', 'Tableau électrique']],
  'chauffe-eau': [['ce-groupe', 'Groupe de sécurité'], ['ce-100', 'Ballon 100 L'], ['ce-200', 'Ballon 200 L']],
  cuisine: [['cui-debouchage', 'Débouchage'], ['cui-mitigeur', 'Mitigeur'], ['cui-evier-100', 'Évier 100 cm']],
  wc: [['wc-debouchage', 'Débouchage'], ['wc-chasse', 'Chasse d’eau'], ['wc-suspendu', 'WC suspendu']],
  depannage: [['dep-fuite-visible', 'Fuite apparente'], ['dep-vanne', 'Vanne d’arrêt générale'], ['dep-pression', 'Réducteur de pression']],
};
const ficheCoupe = (piece) => {
  const lignes = (FICHES[piece] || []).map(([id, nom]) => { const it = TOUS.get(id); return it && it.prix ? `<span class="coupe__fiche-l"><span>${esc(nom)}</span><b>${esc(euros(it.prix))}</b></span>` : ''; }).join('');
  return lignes ? `<span class="coupe__fiche">${lignes}<span class="coupe__fiche-pied">Estimer ce poste →</span></span>` : '';
};

function coupe(root = '') {
  const P = Object.fromEntries(PIECES.map((p) => [p.id, p]));
  const fins = Array.from({ length: 11 }, (_, i) => `<path d="M${530 + i * 10} 276 V308"/>`).join('');
  const hs = HOTSPOTS.map((h, i) => `<a class="coupe__point" href="${root}estimation.html?piece=${h.piece}" data-point="${h.piece}" aria-label="${esc(h.label)} : dès ${esc(euros(prixMin(P[h.piece])))}, estimer">
      <circle class="coupe__onde" cx="${h.x}" cy="${h.y}" r="10"/>
      <circle class="coupe__pastille" cx="${h.x}" cy="${h.y}" r="11"/>
      <text class="coupe__num" x="${h.x}" y="${h.y + 4}" text-anchor="middle">${i + 1}</text>
    </a>`).join('\n    ');
  return `<svg class="coupe" viewBox="0 0 760 600" role="img" aria-labelledby="coupe-titre" data-coupe-svg>
  <title id="coupe-titre">Coupe d’une maison : réseau d’eau froide, d’eau chaude, de chauffage et d’évacuation, avec les équipements sur lesquels Pedro intervient</title>
  <defs>
    <pattern id="hach" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V10" stroke="var(--encre)" stroke-width="1" opacity=".35"/></pattern>
    <pattern id="terre" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><path d="M0 0V14" stroke="var(--encre)" stroke-width="1" opacity=".22"/></pattern>
  </defs>
  <g class="coupe__structure">
    <rect class="coupe__terre" x="0" y="552" width="760" height="48" fill="url(#terre)"/>
    <path class="trait trait--fort" d="M0 552 H760"/>
    <path class="trait trait--fort" d="M30 156 L380 38 L730 156"/>
    <path class="trait" d="M60 150 L380 54 L700 150"/>
    <rect class="trait mur" x="60" y="140" width="14" height="412" fill="url(#hach)"/>
    <rect class="trait mur" x="686" y="140" width="14" height="412" fill="url(#hach)"/>
    <rect class="trait mur" x="60" y="140" width="640" height="10" fill="url(#hach)"/>
    <rect class="trait mur" x="60" y="330" width="640" height="14" fill="url(#hach)"/>
    <rect class="trait mur" x="60" y="540" width="640" height="12" fill="url(#hach)"/>
    <rect class="trait mur" x="300" y="344" width="10" height="196" fill="url(#hach)"/>
    <rect class="trait mur" x="460" y="150" width="10" height="180" fill="url(#hach)"/>
    <rect class="fenetre" x="60" y="190" width="14" height="56"/><path class="trait" d="M67 190 V246"/>
    <rect class="fenetre" x="686" y="196" width="14" height="70"/><path class="trait" d="M693 196 V266"/>
    <rect class="fenetre" x="686" y="430" width="14" height="110"/><path class="trait trait--fin" d="M686 430 A 92 92 0 0 0 600 520"/>
  </g>
  <g class="coupe__equipements">
    <rect class="equip" x="92" y="284" width="150" height="46" rx="6"/><rect class="equip equip--int" x="100" y="291" width="134" height="31" rx="12"/><rect class="equip" x="104" y="268" width="14" height="16" rx="2"/>
    <rect class="equip" x="262" y="322" width="70" height="8"/><path class="trait verre" d="M334 196 V322"/><path class="trait" d="M286 300 V202 H306"/><rect class="equip" x="300" y="200" width="18" height="6" rx="3"/>
    <rect class="equip" x="360" y="286" width="80" height="44"/><rect class="equip" x="354" y="276" width="92" height="10" rx="3"/><rect class="equip equip--miroir" x="372" y="198" width="56" height="54" rx="4"/><path class="trait" d="M400 276 V264 H410"/>
    <rect class="equip" x="520" y="272" width="120" height="40" rx="3"/><g class="trait trait--fin">${fins}</g><circle class="equip" cx="514" cy="306" r="4"/><circle class="equip" cx="646" cy="306" r="4"/>
    <circle class="equip equip--lampe" cx="400" cy="164" r="6"/><circle class="equip equip--lampe" cx="580" cy="164" r="6"/><circle class="equip equip--lampe" cx="190" cy="358" r="6"/>
    <rect class="equip" x="90" y="488" width="190" height="52"/><rect class="equip" x="86" y="480" width="198" height="8"/><rect class="equip equip--int" x="150" y="481" width="60" height="14" rx="3"/><path class="trait" d="M180 480 V462 Q180 454 188 454 H194"/>
    <rect class="equip equip--pointille" x="90" y="374" width="190" height="46"/>
    <rect class="equip" x="230" y="492" width="46" height="46" rx="3"/><circle class="equip equip--int" cx="253" cy="515" r="13"/>
    <rect class="equip" x="334" y="468" width="24" height="32" rx="2"/><path class="equip" d="M330 504 H382 Q380 524 366 528 L364 540 H346 L344 528 Q332 522 330 504 Z"/>
    <rect class="equip" x="430" y="372" width="56" height="64" rx="3"/><path class="trait trait--fin" d="M438 388 H478 M438 404 H478 M438 420 H478"/>
    <rect class="equip equip--ballon" x="580" y="362" width="60" height="120" rx="26"/><path class="trait trait--fin" d="M590 400 H630"/><rect class="equip" x="592" y="486" width="12" height="12" rx="2"/>
    <circle class="equip" cx="668" cy="528" r="9"/><path class="trait trait--fin" d="M662 528 H674 M668 522 V534"/>
  </g>
  <g class="coupe__reseaux">
    <g class="reseau-evac">
      <path d="M400 330 V338 H84"/><path d="M150 330 V338"/><path d="M298 330 V338"/>
      <path d="M84 338 V562"/><path d="M372 562 H8"/><path d="M356 540 V562"/><path d="M200 496 V510 H84"/>
    </g>
    <g class="reseau-elec">
      <path d="M458 372 V352 H580 V170"/><path d="M458 352 H400 V170"/><path d="M430 404 H310 V364 H190"/>
    </g>
    <g class="reseau-cuivre">
      <path d="M514 306 V350 H680"/><path d="M646 306 V340 H680"/>
    </g>
    <g class="reseau-chaud">
      <path d="M612 362 V362 H126 V280"/><path d="M278 362 V300"/><path d="M416 362 V280"/><path d="M172 362 V492"/>
    </g>
    <g class="reseau-froid">
      <path d="M760 562 H668 V537"/><path d="M659 528 H190 V492"/><path d="M598 528 V498"/><path d="M366 528 V488 H358"/>
      <path d="M294 528 V352"/><path d="M118 352 H408"/><path d="M118 352 V280"/><path d="M286 352 V300"/><path d="M408 352 V280"/>
    </g>
  </g>
  <g class="coupe__points">
    ${hs}
  </g>
</svg>`;
}

function etiquettesCoupe(root = '') {
  const P = Object.fromEntries(PIECES.map((p) => [p.id, p]));
  return HOTSPOTS.map((h) => `<a class="coupe__etiquette dir-${h.dir}" href="${root}estimation.html?piece=${h.piece}" data-etiquette="${h.piece}" style="--x:${(h.x / 7.6).toFixed(2)}%;--y:${(h.y / 6).toFixed(2)}%" tabindex="-1" aria-hidden="true"><span class="coupe__etiquette-in"><span class="coupe__etiquette-tete">${esc(h.label)} <b>dès ${esc(euros(prixMin(P[h.piece])))}</b></span>${ficheCoupe(h.piece)}</span></a>`).join('\n      ');
}

function legendeCoupe(root = '') {
  const P = Object.fromEntries(PIECES.map((p) => [p.id, p]));
  return `<ol class="coupe__legende">
      ${HOTSPOTS.map((h, i) => `<li><a href="${root}estimation.html?piece=${h.piece}"><span class="mono">${i + 1}</span>${esc(h.label)}<b>dès ${esc(euros(prixMin(P[h.piece])))}</b></a></li>`).join('\n      ')}
    </ol>`;
}

/* ---------- carte de la zone ---------- */
function carte() {
  // Projection équirectangulaire locale, échelle : 1 km = 9 unités
  const k = 9, cx = 380, cy = 330, coslat = Math.cos((CENTRE.lat * Math.PI) / 180);
  const pt = (lat, lon) => [cx + (lon - CENTRE.lon) * 111.32 * coslat * k, cy - (lat - CENTRE.lat) * 110.57 * k];
  const r = SITE.rayonKm * k;
  const oise = OISE.map(([la, lo], i) => { const [x, y] = pt(la, lo); return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; }).join(' ');
  const villes = COMMUNES.map((c) => {
    const [x, y] = pt(c.lat, c.lon); const d = distanceKm(CENTRE, c);
    const gauche = x < cx - 40 || c.etiquette === 'gauche';
    return `<g class="ville${c.grande ? ' ville--grande' : ''}" data-ville="${esc(c.nom)}" data-angle="${(Math.atan2(y - cy, x - cx) * 180 / Math.PI).toFixed(1)}" data-km="${d.toFixed(0)}">
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${c.grande ? 6 : 4}"/>
      <text x="${(x + (gauche ? -10 : 10)).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${gauche ? 'end' : 'start'}">${esc(c.nom)}</text>
    </g>`;
  }).join('\n    ');
  const anneaux = [10, 20].map((km) => `<circle class="carte__anneau" cx="${cx}" cy="${cy}" r="${km * k}"/><text class="carte__km" x="${cx - km * k * 0.71 - 6}" y="${cy - km * k * 0.71 - 6}" text-anchor="end">${km} km</text>`).join('');
  return `<svg class="carte" viewBox="0 0 760 660" role="img" aria-labelledby="carte-titre" data-carte-svg>
    <title id="carte-titre">Carte schématique : rayon de 30 km autour de Longueil-Sainte-Marie et communes desservies</title>
    <defs><radialGradient id="zone-fond" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="var(--eau-froide)" stop-opacity=".18"/><stop offset="1" stop-color="var(--eau-froide)" stop-opacity=".02"/></radialGradient></defs>
    <circle class="carte__zone" cx="${cx}" cy="${cy}" r="${r}" fill="url(#zone-fond)"/>
    ${anneaux}
    <path class="carte__oise" d="${oise}"/>
    <path class="carte__oise-eau" d="${oise}"/>
    <text class="carte__oise-label" x="${pt(49.33, 2.735)[0] + 14}" y="${pt(49.33, 2.735)[1]}">L’Oise</text>
    <circle class="carte__rayon" cx="${cx}" cy="${cy}" r="${r}"/>
    <g class="carte__compas" data-compas><path d="M${cx} ${cy} L${cx + r} ${cy}"/><circle cx="${cx + r}" cy="${cy}" r="5"/></g>
    <text class="carte__km carte__km--30" x="${cx - r * 0.71 - 8}" y="${cy - r * 0.71 - 8}" text-anchor="end">30 km</text>
    ${villes}
    <g class="ville ville--centre"><circle cx="${cx}" cy="${cy}" r="9"/><circle class="ville__onde" cx="${cx}" cy="${cy}" r="9"/><text x="${cx + 14}" y="${cy + 26}">${CENTRE.nom}</text></g>
  </svg>`;
}

function listeCommunes() {
  const secteurs = [...new Set(COMMUNES.map((c) => c.secteur))];
  return secteurs.map((s) => `<div class="secteur"><p class="secteur__titre mono">Secteur ${esc(s)}</p><ul>${COMMUNES.filter((c) => c.secteur === s).map((c) => `<li><button type="button" data-ville-btn="${esc(c.nom)}">${esc(c.nom)} <span class="mono">≈ ${distanceKm(CENTRE, c).toFixed(0)} km</span></button></li>`).join('')}</ul></div>`).join('');
}

/* ---------- compteur à rouleaux ---------- */
const compteur = (valeur, cls = '') => `<div class="compteur ${cls}" data-compteur data-valeur="${valeur}">
  <span class="visuellement-cache" aria-live="polite" data-compteur-texte>${euros(valeur)}</span>
  <span class="compteur__cadran" aria-hidden="true" data-compteur-cadran></span>
  <span class="compteur__unite" aria-hidden="true">€ TTC</span>
</div>`;

/* ---------- ACCUEIL ---------- */
const EXEMPLES = {
  wc: ['wc-suspendu', 'WC suspendu posé'], lavabo: ['lav-meuble', 'Meuble vasque posé'], douche: ['dou-bac-90', 'Receveur 90 × 90'],
  baignoire: ['bai-170', 'Baignoire 170 cm'], cuisine: ['cui-evier-100', 'Évier 100 cm'], 'chauffe-eau': ['ce-groupe', 'Groupe de sécurité'],
  radiateurs: ['rad-remplacement', 'Radiateur remplacé'], electricite: ['el-tableau', 'Tableau électrique'], depannage: ['dep-fuite-cachee', 'Fuite encastrée'],
  pmr: ['pmr-douche', 'Douche de plain-pied'],
};
const exemple = (p) => { const e = EXEMPLES[p.id]; const it = e && TOUS.get(e[0]); return it && it.prix ? `Ex. ${e[1]} · ${euros(it.prix)}` : `${nbTarifs(p)} tarifs affichés`; };
function accueil() {
  const P = Object.fromEntries(PIECES.map((p) => [p.id, p]));
  const cartes = PIECES.map((p, i) => `<a class="carte-piece" href="estimation.html?piece=${p.id}" data-ripple data-curseur-texte="Estimer">
        <span class="carte-piece__raccord" aria-hidden="true"></span>
        <span class="carte-piece__img">${img(p.img, '', { sizes: '(max-width: 700px) 70vw, 30vw', cls: 'carte-piece__photo' })}</span>
        <span class="carte-piece__bas">
          <span class="carte-piece__num mono">${String(i + 1).padStart(2, '0')} · ${nbTarifs(p)} tarifs</span>
          <span class="carte-piece__nom">${esc(p.nom)}</span>
          <span class="carte-piece__info mono">${esc(exemple(p))}</span>
          <span class="carte-piece__prix"><span class="mono">dès</span> ${esc(euros(prixMin(p)))}</span>
        </span>
      </a>`).join('\n      ');

  const etapes = [
    ['Sélectionnez la pièce', 'Cuisine, salle de bains, WC, chauffage ou réseau électrique.'],
    ['Choisissez vos prestations', 'Cochez l’intervention ou le dépannage souhaité dans la liste.'],
    ['Obtenez un tarif clair', 'Le prix calculé sert de base ferme pour votre intervention.'],
    ['Validez, sereinement', 'Une fois le tarif confirmé ensemble avant travaux, il ne change plus, sauf devis complémentaire que vous demandez.'],
  ];
  const demo = [
    ['wc-debouchage', 'WC bouché'],
    ['ce-groupe', 'Groupe de sécurité'],
    ['wc-standard', 'WC standard posé'],
    ['ce-200', 'Ballon 200 L'],
  ];
  const ITEM = new Map(); for (const p of PIECES) for (const g of p.groupes) for (const it of g.items) ITEM.set(it.id, it);
  const pmr = P.pmr.groupes[0].items;

  const contenu = `
<section class="hero" id="haut" data-section>
  <div class="wrap hero__grille">
    <div class="hero__texte">
      ${eyebrow('01', 'Plomberie · chauffage · électricité — Oise (60)')}
      <h1 class="titre-xl" data-split>Votre plombier dans l’Oise. <em>Le prix, avant le déplacement.</em></h1>
      <p class="lead" data-apparait>Dépannage, sanitaires, chauffe-eau, radiateurs et petite électricité. Pedro intervient seul, sans intermédiaire, à ${SITE.rayonKm}&nbsp;km autour de ${SITE.ville}. Choisissez la pièce, cochez l’intervention&nbsp;: le tarif s’affiche.</p>
      <div class="hero__cta" data-apparait>
        <a class="btn btn--cuivre btn--grand" href="estimation.html" data-magnet>Estimer mon prix ${ICONES.fleche}</a>
        <a class="btn btn--ligne btn--grand" href="${SITE.telHref}" data-magnet>${ICONES.tel}<span>${SITE.tel}</span></a>
      </div>
      <ul class="hero__faits mono" data-apparait>
        <li><b>${TOTAL}</b> tarifs TTC affichés</li>
        <li><b>1</b> artisan, sans sous-traitance</li>
        <li><b>${SITE.rayonKm} km</b> autour de ${SITE.ville}</li>
      </ul>
    </div>
    <figure class="hero__planche" data-planche>
      <div class="planche">
        <canvas class="gl-flux" data-gl-flux aria-hidden="true"></canvas>
        ${coupe()}
        <div class="coupe__etiquettes" aria-hidden="true">
      ${etiquettesCoupe()}
        </div>
        <div class="planche__photo" data-cotes>
          <picture>
            <source media="(max-width: 700px)" srcset="assets/img/hero-reseau-mobile-480.webp 480w, assets/img/hero-reseau-mobile-784.webp 784w" sizes="40vw">
            ${img('hero-reseau', 'Mur de salle de bain ouvert sur des canalisations en cuivre et des alimentations bleues et rouges bien alignées', { sizes: '(max-width: 700px) 40vw, 22vw', eager: true })}
          </picture>
          <span class="planche__photo-legende mono">Réseau encastré</span>
        </div>
      </div>
      <figcaption class="cartouche mono">
        <span>Planche 01</span><span>Coupe de principe</span><span>Simple Travaux · ${SITE.ville}</span>
        <span class="cartouche__legende"><span><i class="l-froid"></i>Eau froide</span><span><i class="l-chaud"></i>Eau chaude</span><span><i class="l-cuivre"></i>Chauffage</span><span><i class="l-evac"></i>Évacuation</span><span><i class="l-elec"></i>Électricité</span></span>
      </figcaption>
      ${legendeCoupe()}
    </figure>
  </div>
</section>

<section class="urgence sombre" id="urgence" data-section>
  <div class="defile" aria-hidden="true"><div class="defile__piste" data-defile>${Array(2).fill('<span>Fuite d’eau</span><span>WC bouché</span><span>Plus d’eau chaude</span><span>Évier bouché</span><span>Groupe de sécurité qui fuit</span><span>Radiateur qui chauffe mal</span><span>Recherche de panne électrique</span>').join('')}</div></div>
  <div class="wrap urgence__grille">
    <div class="urgence__texte">
      ${eyebrow('02', 'Urgence', true)}
      <h2 class="titre-l" data-split>Une fuite, un WC bouché, plus d’eau chaude&nbsp;?</h2>
      <p data-apparait>Appelez directement Pedro, sans standard ni plateforme. Prise en charge rapide selon disponibilité, du lundi au samedi de 8h à 19h, autour de ${SITE.ville}.</p>
      <div class="urgence__actions" data-apparait>
        <a class="btn btn--cuivre btn--xl" href="${SITE.telHref}" data-magnet data-goutte>${ICONES.tel}<span>${SITE.tel}</span></a>
        <span class="voyant voyant--clair voyant--grand" data-voyant><i></i><span data-voyant-texte>Lun–sam 8h–19h</span></span>
      </div>
      <p class="urgence__note mono" data-apparait>Appel ou SMS · Dépannage fuite apparente dès ${euros(ITEM.get('dep-fuite-visible').prix)}</p>
    </div>
    <figure class="urgence__visuel" data-gouttes>
      <div class="urgence__photo" data-parallaxe>${img('fuite-macro', 'Goutte d’eau qui se forme sur un raccord en cuivre', { sizes: '(max-width: 900px) 100vw, 50vw' })}</div>
      <canvas class="urgence__gouttes" data-gouttes-canvas aria-hidden="true"></canvas>
      <div class="urgence__vignette">${img('depannage-fuite-seau', 'Seau sous une canalisation qui fuit', { sizes: '200px' })}<span class="mono">Fuite apparente<br><b>dès ${euros(ITEM.get('dep-fuite-visible').prix)}</b></span></div>
    </figure>
  </div>
</section>

<section class="horizontal" id="pieces" data-section data-horizontal>
  <div class="wrap horizontal__tete">
    ${eyebrow('03', 'Les pièces')}
    <div class="horizontal__titres">
      <h2 class="titre-l titre-borne" data-split>Choisissez la pièce, le prix suit.</h2>
      <p class="horizontal__aide mono"><span>${PIECES.length} pièces</span> <span class="horizontal__fleche">Faites défiler ${ICONES.fleche}</span></p>
    </div>
  </div>
  <div class="horizontal__fenetre" data-fenetre>
    <div class="horizontal__piste" data-piste>
      <svg class="piste__tuyau" data-piste-tuyau aria-hidden="true"><path class="piste__cuivre"/><path class="piste__eau"/></svg>
      ${cartes}
      <a class="carte-fin" href="estimation.html" data-magnet><span class="mono">Toutes les pièces</span><span class="carte-fin__titre">Ouvrir l’estimateur</span>${ICONES.fleche}</a>
    </div>
  </div>
  <div class="wrap horizontal__progression mono" aria-hidden="true"><span data-piste-num>01</span><span class="horizontal__barre"><i data-piste-barre></i></span><span>${String(PIECES.length).padStart(2, '0')}</span></div>
</section>

<section class="etapes" id="comment" data-section data-etapes>
  <div class="wrap etapes__grille">
    <figure class="etapes__visuel" data-cotes>
      ${img('mains-raccord', 'Mains gantées serrant un raccord en laiton sous un lavabo', { sizes: '(max-width: 900px) 100vw, 40vw' })}
      <svg class="cotes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="cote" d="M-4 0 V100"/><path class="cote" d="M0 104 H100"/></svg>
    </figure>
    <div class="etapes__contenu">
      ${eyebrow('04', 'Comment ça marche')}
      <h2 class="titre-l titre-borne" data-split>Quatre vannes, zéro surprise.</h2>
      <ol class="etapes__liste">
        ${etapes.map(([t, d], i) => `<li class="etape" data-etape>
          <span class="etape__vanne" aria-hidden="true"><span class="etape__tuyau"><i></i></span><span class="etape__corps"><span class="etape__poignee"></span></span></span>
          <span class="etape__texte"><span class="mono etape__num">Étape ${i + 1}</span><span class="etape__titre">${esc(t)}</span><span class="etape__desc"><span>${esc(d)}</span></span></span>
        </li>`).join('\n        ')}
      </ol>
    </div>
  </div>
</section>

<section class="prix" id="prix" data-section>
  <div class="wrap prix__grille">
    <div class="prix__texte">
      ${eyebrow('05', 'Le prix, avant les travaux')}
      <h2 class="titre-l" data-split>Le tarif s’affiche. Il ne bouge plus.</h2>
      <p data-apparait>Finies les hésitations au moment de la facture. Le tarif validé avant le début de l’intervention reste fixe. Si un imprévu demande des travaux en plus, un devis complémentaire vous est présenté, et rien n’est fait sans votre accord.</p>
      <ul class="conditions" data-apparait>
        ${CONDITIONS.map((c) => `<li><span>${esc(c.label)}</span><b class="mono">${esc(c.valeur)}</b><em>${esc(c.note)}</em></li>`).join('\n        ')}
      </ul>
      <p class="petit" data-apparait>Un devis détaillé vous est remis avant toute intervention. Tarifs indicatifs pour une intervention standard, dans des conditions normales d’accès.</p>
    </div>
    <div class="prix__demo" data-demo>
      <p class="mono prix__demo-titre">Exemples de tarifs</p>
      ${compteur(ITEM.get(demo[0][0]).prix, 'compteur--xl')}
      <p class="prix__ligne" data-demo-ligne>${esc(ITEM.get(demo[0][0]).nom)} — WC</p>
      <div class="prix__choix" role="group" aria-label="Choisir un exemple">
        ${demo.map(([id, l], i) => `<button type="button" class="puce" data-demo-btn="${id}" data-demo-prix="${ITEM.get(id).prix}" data-demo-nom="${esc(ITEM.get(id).nom)}" aria-pressed="${i === 0}">${esc(l)}</button>`).join('\n        ')}
      </div>
      <a class="btn btn--cuivre" href="estimation.html" data-magnet>Faire mon estimation complète ${ICONES.fleche}</a>
    </div>
    <figure class="prix__visuel" data-cotes>
      <div class="cotes-cadre">${img('chauffe-eau', 'Chauffe-eau électrique mural dans une buanderie claire', { sizes: '(max-width: 900px) 100vw, 30vw' })}
      <svg class="cotes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="cote" d="M-5 0 V100"/><path class="cote" d="M0 104 H100"/></svg></div>
      <figcaption class="mono">Ballon 200 L posé · ${euros(ITEM.get('ce-200').prix)}</figcaption>
    </figure>
  </div>
</section>

<section class="pedro" id="pedro" data-section>
  <div class="wrap pedro__grille">
    <figure class="pedro__portrait" data-cotes>
      <svg class="portrait-provisoire" viewBox="0 0 400 460" aria-hidden="true">
        <defs><pattern id="pp-grille" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" class="pp-grille"/></pattern></defs>
        <rect width="400" height="460" fill="url(#pp-grille)"/>
        <path class="pp-croix" d="M200 24 V436 M24 176 H376"/>
        <circle class="pp-cible" cx="200" cy="176" r="96"/>
        <path class="pp-buste" d="M86 436 Q92 312 200 300 Q308 312 314 436 Z"/>
        <path class="pp-col" d="M168 304 L200 352 L232 304"/>
        <circle class="pp-tete" cx="200" cy="176" r="62"/>
        <path class="pp-cote" d="M36 114 V436 M29 114 H43 M29 436 H43 M364 114 V238 M357 114 H371 M357 238 H371"/>
        <path class="pp-coins" d="M14 40 V14 H40 M360 14 H386 V40 M386 420 V446 H360 M40 446 H14 V420"/>
        <g class="pp-tampon" transform="rotate(-8 200 392)"><rect x="92" y="364" width="216" height="56" rx="5"/><rect x="99" y="371" width="202" height="42" rx="3" class="pp-tampon__in"/><text x="200" y="398" text-anchor="middle">PHOTO À FOURNIR</text></g>
      </svg>
      <figcaption class="mono">Portrait de Pedro<br><b>emplacement réservé</b></figcaption>
    </figure>
    <div class="pedro__texte">
      ${eyebrow('06', 'Votre artisan')}
      <h2 class="titre-l" data-split>Pedro, artisan indépendant. Pas de plateforme, pas de sous-traitance.</h2>
      <p data-apparait>Derrière l’écran, il n’y a ni plateforme d’appels anonyme, ni sous-traitance opaque. Pedro est basé à ${SITE.ville} et spécialisé dans le dépannage de plomberie, l’installation sanitaire, le chauffage et les petits travaux de rénovation. Après avoir constaté trop de tarifs flous et de devis gonflés dans le dépannage, il a bâti son activité sur des règles claires.</p>
      <ol class="engagements" data-apparait>
        <li><span class="mono">01</span><b>Un chiffrage transparent</b>Vous choisissez la pièce et l’intervention : vous avez une base tarifaire nette avant tout déplacement.</li>
        <li><span class="mono">02</span><b>Aucun surcoût imprévu</b>Le prix convenu reste ferme. Tout imprévu passe par un devis complémentaire validé avec vous.</li>
        <li><span class="mono">03</span><b>Le travail bien fait</b>Intervenant seul, Pedro tient à des interventions propres, durables et conformes aux normes de sécurité.</li>
      </ol>
      <dl class="a-completer" data-apparait>
        <div><dt>Assurance décennale</dt><dd>à compléter</dd></div>
        <div><dt>Qualifications</dt><dd>à compléter</dd></div>
        <div><dt>SIRET</dt><dd>à compléter</dd></div>
      </dl>
    </div>
    <figure class="pedro__atelier" data-parallaxe>
      ${img('atelier', 'Établi de plombier : raccords en laiton, tubes de cuivre, coupe-tube, mètre pliant', { sizes: '(max-width: 900px) 60vw, 24vw' })}
    </figure>
  </div>
</section>

<section class="zone sombre" id="zone" data-section>
  <div class="zone__fond" aria-hidden="true">${img('riviere', '', { sizes: '100vw', cls: 'zone__fond-img' })}</div>
  <div class="wrap zone__grille">
    <div class="zone__texte">
      ${eyebrow('07', 'Zone d’intervention', true)}
      <h2 class="titre-l" data-split>${SITE.rayonKm} km autour de ${SITE.ville}.</h2>
      <p data-apparait>Implanté au cœur de l’Oise, Pedro intervient chaque jour dans un rayon de ${SITE.rayonKm} km autour de son atelier : frais et délais de déplacement réduits au minimum.</p>
      <div class="secteurs" data-apparait>${listeCommunes()}</div>
      <p class="petit mono" data-apparait>Carte schématique · distances à vol d’oiseau, approximatives.</p>
    </div>
    <figure class="zone__carte" data-carte>
      ${carte()}
      <figcaption class="zone__info mono" data-carte-info aria-live="polite">Survolez une commune</figcaption>
    </figure>
  </div>
</section>

<section class="pmr" id="pmr" data-section>
  <div class="wrap pmr__grille">
    <figure class="pmr__visuel" data-cotes>
      <div class="pmr__photo" data-parallaxe>${img('pmr', 'Salle de bain accessible : douche de plain-pied, siège rabattable, barres d’appui, lavabo suspendu', { sizes: '(max-width: 900px) 100vw, 55vw' })}</div>
      <svg class="cotes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="cote" d="M0 -4 H100"/><path class="cote" d="M103 0 V100"/></svg>
      <div class="pmr__site">${img('salle-de-bain-pmr-site', 'Salle de bain PMR présentée sur le site actuel', { sizes: '220px' })}</div>
    </figure>
    <div class="pmr__texte">
      ${eyebrow('08', 'Salle de bain PMR')}
      <h2 class="titre-l" data-split>Une salle de bain adaptée, pour rester autonome.</h2>
      <p data-apparait>Remplacer la baignoire par une douche de plain-pied, poser des barres d’appui, un WC réhaussé ou un lavabo accessible en fauteuil : chaque adaptation a son tarif.</p>
      <ul class="tarifs-liste" data-apparait>
        ${pmr.map((it) => `<li><span>${esc(it.nom)}</span><b class="mono">${euros(it.prix)}</b></li>`).join('\n        ')}
      </ul>
      <a class="btn btn--cuivre" href="estimation.html?piece=pmr" data-magnet>Estimer mon adaptation ${ICONES.fleche}</a>
    </div>
  </div>
</section>

<section class="appel sombre" id="appel" data-section data-masque-barre>
  <div class="appel__fond" aria-hidden="true">${img('plombier-lavabo', '', { sizes: '100vw' })}</div>
  <div class="wrap appel__in">
    ${eyebrow('09', 'Une urgence ou un projet', true)}
    <h2 class="titre-l" data-split>Parlez directement à votre artisan.</h2>
    <a class="appel__numero" href="${SITE.telHref}" data-goutte data-magnet><span>${SITE.tel}</span></a>
    <div class="appel__actions">
      <a class="btn btn--cuivre" href="${SITE.telHref}" data-magnet>${ICONES.tel}<span>Appeler</span></a>
      <a class="btn btn--clair" href="${SITE.smsHref}" data-magnet>${ICONES.sms}<span>Envoyer un SMS</span></a>
      <a class="btn btn--clair" href="estimation.html" data-magnet>Estimer en ligne</a>
      <a class="btn btn--clair" href="contact.html#rendez-vous" data-magnet>${ICONES.cal}<span>Prendre rendez-vous</span></a>
    </div>
    <p class="mono appel__horaires">Du lundi au samedi, 8h–19h · <span data-voyant><i></i><span data-voyant-texte></span></span></p>
  </div>
</section>`;
  return page({
    id: 'accueil',
    titre: 'Simple Travaux : plombier dans l’Oise (60), le prix avant le déplacement',
    description: `Pedro, artisan plombier, chauffagiste et électricien à Longueil-Sainte-Marie. Dépannage, sanitaires, chauffe-eau. Estimez votre prix en ligne : ${TOTAL} tarifs TTC affichés.`,
    og: 'og-accueil', chemin: '/', contenu,
  });
}

/* ---------- ESTIMATION ---------- */
function estimation() {
  const tuiles = PIECES.map((p, i) => `<button type="button" class="tuile" data-piece-btn="${p.id}" aria-pressed="false" data-tilt>
          <span class="tuile__img">${img(p.img, '', { sizes: '(max-width: 700px) 40vw, 14vw' })}</span>
          <span class="tuile__num mono">${String(i + 1).padStart(2, '0')}</span>
          <span class="tuile__nom">${esc(p.nom)}</span>
          <span class="tuile__prix mono">dès ${esc(euros(prixMin(p)))}</span>
          <span class="tuile__compte mono" data-tuile-compte></span>
        </button>`).join('\n        ');

  const listes = PIECES.map((p) => `<div class="presta" data-presta="${p.id}" hidden>
          <div class="presta__tete">
            <h3 class="presta__titre">${esc(p.nom)}</h3>
            <p>${esc(p.intro)}</p>
          </div>
          ${p.groupes.map((g) => `<fieldset class="groupe">
            <legend class="mono">${esc(g.titre)}</legend>
            ${g.items.map((it) => `<label class="ligne${it.img ? ' ligne--img' : ''}${it.prix == null ? ' ligne--devis' : ''}">
              <input type="checkbox" value="${it.id}" data-presta-input${it.prix == null ? ' disabled' : ''}>
              <span class="ligne__vanne" aria-hidden="true"><i></i></span>
              ${it.img ? `<span class="ligne__img">${img(it.img, '', { sizes: '72px' })}</span>` : ''}
              <span class="ligne__texte"><span class="ligne__nom">${esc(it.nom)}</span><span class="ligne__desc">${esc(it.desc)}</span></span>
              <span class="ligne__prix mono">${it.prix == null ? 'Sur devis' : esc(euros(it.prix))}</span>
            </label>`).join('\n            ')}
          </fieldset>`).join('\n          ')}
        </div>`).join('\n        ');

  const inclus = [
    'Une intervention standard, dans des conditions normales d’accès et de réalisation',
    'La fourniture et la main-d’œuvre, lorsque la prestation le précise',
    'Pour une pose : dépose et évacuation de l’ancien équipement, consommables, raccordements et essais d’étanchéité',
  ];
  const complement = [
    'Canalisation fortement détériorée',
    'Accès difficile à une canalisation encastrée',
    'Remplacement de plusieurs éléments',
    'Recherche de fuite nécessitant des moyens spécifiques',
    'Réparation nécessitant une ouverture de mur ou de sol',
  ];

  const contenu = `
<section class="estim-hero" data-section>
  <div class="wrap estim-hero__grille">
    <div class="estim-hero__texte">
      ${eyebrow('01', 'Estimateur · tarifs TTC')}
      <h1 class="titre-xl" data-split>Votre prix en <em>trois gestes.</em></h1>
      <p class="lead" data-apparait>Choisissez la pièce, cochez l’intervention, le total s’affiche. Ce sont les tarifs publiés par Pedro pour une intervention standard.</p>
      <ol class="gestes mono" data-apparait><li><span>1</span>La pièce</li><li><span>2</span>Les prestations</li><li><span>3</span>La demande</li></ol>
    </div>
    <figure class="estim-hero__visuel" data-cotes>
      ${img('wc-suspendu-salle', 'Petite salle de bain claire avec WC suspendu et meuble vasque', { sizes: '(max-width: 900px) 100vw, 45vw', eager: true })}
      <svg class="cotes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="cote" d="M0 -4 H100"/><path class="cote" d="M-3 0 V100"/></svg>
      <div class="estim-hero__compteur">${compteur(0, 'compteur--hero')}<span class="mono">Votre total en direct</span></div>
    </figure>
  </div>
</section>

<section class="estim" id="estimateur" data-section data-estimateur>
  <div class="wrap estim__grille">
    <div class="estim__principal">
      <div class="estim__etape" id="etape-piece">
        ${eyebrow('02', 'Étape 1 · la pièce')}
        <h2 class="titre-m">Quelle pièce est concernée&nbsp;?</h2>
        <div class="tuiles" role="group" aria-label="Pièces">
        ${tuiles}
        </div>
      </div>
      <div class="estim__etape" id="etape-presta">
        ${eyebrow('03', 'Étape 2 · les prestations')}
        <h2 class="titre-m" data-presta-titre>Cochez les interventions</h2>
        <p class="estim__vide" data-presta-vide>Choisissez d’abord une pièce ci-dessus.</p>
        ${listes}
      </div>
    </div>
    <aside class="recap" id="recap" data-recap aria-labelledby="recap-titre">
      <div class="recap__in">
        <div class="recap__tete">
          <p class="recap__titre" id="recap-titre">Votre estimation</p>
          <button class="recap__fermer" type="button" data-recap-fermer><span class="visuellement-cache">Fermer le récapitulatif</span>×</button>
        </div>
        ${compteur(0, 'compteur--recap')}
        <p class="recap__ttc mono">Total TTC des prestations</p>
        <ul class="recap__lignes" data-recap-lignes><li class="recap__rien">Aucune prestation pour l’instant.</li></ul>
        <ul class="recap__notes">
          <li>Déplacement : 50,00 € HT dans un rayon de 30 km, <em>inclusion dans les tarifs à confirmer</em>.</li>
          <li>Tarifs indicatifs pour une intervention standard. Un devis détaillé vous est remis avant toute intervention.</li>
        </ul>
        <div class="recap__actions">
          <a class="btn btn--cuivre" href="#demande" data-recap-demande>Demander l’intervention ${ICONES.fleche}</a>
          <button class="btn btn--texte" type="button" data-recap-vider>Tout effacer</button>
        </div>
      </div>
    </aside>
  </div>
</section>

<section class="demande" id="demande" data-section>
  <div class="wrap demande__grille">
    <div class="demande__texte">
      ${eyebrow('04', 'Étape 3 · la demande')}
      <h2 class="titre-l" data-split>Pedro vous rappelle pour confirmer.</h2>
      <p data-apparait>Votre sélection est jointe à la demande. Le tarif est confirmé ensemble avant l’intervention.</p>
      <div class="demande__resume" data-demande-resume><p class="mono">Sélection</p><p data-demande-total>Aucune prestation sélectionnée.</p></div>
    </div>
    <form class="formulaire" data-form-simule="demande" novalidate data-masque-barre>
      <fieldset class="choix-quand">
        <legend>Quand souhaitez-vous l’intervention&nbsp;?</legend>
        <label class="radio-carte"><input type="radio" name="quand" value="urgent" required><span><b>Urgent</b><em>Pedro vous rappelle au plus vite</em></span></label>
        <label class="radio-carte"><input type="radio" name="quand" value="rdv" checked><span><b>Prendre rendez-vous</b><em>Choisir un créneau</em></span></label>
        <label class="radio-carte"><input type="radio" name="quand" value="plus-tard"><span><b>Pas tout de suite</b><em>Pour un projet à venir</em></span></label>
      </fieldset>
      <div class="creneaux" data-creneaux>
        <p class="champ__label">Jour et créneau souhaités <span class="mono">(du lundi au samedi)</span></p>
        <div class="jours" data-jours role="group" aria-label="Jour"></div>
        <div class="heures" data-heures role="group" aria-label="Créneau"></div>
        <p class="petit mono">Créneaux de démonstration, à confirmer par Pedro.</p>
      </div>
      <div class="champs">
        <label class="champ"><span class="champ__label">Nom *</span><input name="nom" autocomplete="name" required></label>
        <label class="champ"><span class="champ__label">Téléphone *</span><input name="tel" type="tel" autocomplete="tel" required inputmode="tel"></label>
        <label class="champ"><span class="champ__label">E-mail *</span><input name="email" type="email" autocomplete="email" required></label>
        <label class="champ"><span class="champ__label">Rue</span><input name="rue" autocomplete="street-address"></label>
        <label class="champ"><span class="champ__label">Code postal</span><input name="cp" autocomplete="postal-code" inputmode="numeric"></label>
        <label class="champ"><span class="champ__label">Ville</span><input name="ville" autocomplete="address-level2"></label>
        <label class="champ champ--large"><span class="champ__label">Précisions</span><textarea name="message" rows="3" maxlength="600"></textarea></label>
      </div>
      <p class="rgpd">Vos coordonnées servent uniquement à traiter votre demande et à vous recontacter. Elles ne sont ni cédées ni vendues. <a href="mentions-legales.html#confidentialite">Politique de confidentialité</a> (à compléter).</p>
      <button class="btn btn--cuivre btn--grand" type="submit">Envoyer ma demande ${ICONES.fleche}</button>
      <p class="petit mono">Maquette : l’envoi est simulé, aucune donnée n’est transmise.</p>
      <div class="confirmation" data-confirmation hidden tabindex="-1"></div>
    </form>
  </div>
</section>

<section class="inclus" data-section>
  <div class="wrap inclus__grille">
    <figure class="inclus__visuel" data-cotes data-parallaxe>
      ${img('chantier-propre', 'Salle de bain en travaux, sol protégé, outils rangés', { sizes: '(max-width: 900px) 100vw, 45vw' })}
      <svg class="cotes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="cote" d="M0 104 H100"/><path class="cote" d="M103 0 V100"/></svg>
    </figure>
    <div class="inclus__texte">
      ${eyebrow('05', 'Ce que comprend le prix')}
      <h2 class="titre-l" data-split>Un prix clair, et ce qu’il couvre.</h2>
      <div class="inclus__colonnes">
        <div><p class="mono inclus__t inclus__t--oui">Compris</p><ul class="coches" data-coches>${inclus.map((t) => `<li class="coche coche--oui">${esc(t)}</li>`).join('')}</ul></div>
        <div><p class="mono inclus__t">Devis complémentaire si</p><ul class="coches" data-coches>${complement.map((t) => `<li class="coche coche--plus">${esc(t)}</li>`).join('')}</ul></div>
      </div>
      <p class="petit" data-apparait>Les travaux supplémentaires sont identifiés avant leur réalisation et soumis à votre validation.</p>
    </div>
  </div>
</section>

<section class="appel appel--court sombre" id="appel" data-section data-masque-barre>
  <div class="appel__fond" aria-hidden="true">${img('plombier-lavabo', '', { sizes: '100vw' })}</div>
  <div class="wrap appel__in">
    ${eyebrow('06', 'Un doute sur une ligne', true)}
    <h2 class="titre-l" data-split>Pedro vous répond avant de valider.</h2>
    <a class="appel__numero" href="${SITE.telHref}" data-goutte data-magnet><span>${SITE.tel}</span></a>
    <div class="appel__actions">
      <a class="btn btn--cuivre" href="${SITE.telHref}" data-magnet>${ICONES.tel}<span>Appeler</span></a>
      <a class="btn btn--clair" href="${SITE.smsHref}" data-magnet>${ICONES.sms}<span>Envoyer un SMS</span></a>
      <a class="btn btn--clair" href="contact.html#rendez-vous" data-magnet>${ICONES.cal}<span>Prendre rendez-vous</span></a>
    </div>
    <p class="mono appel__horaires">Du lundi au samedi, 8h–19h · <span data-voyant><i></i><span data-voyant-texte></span></span></p>
  </div>
</section>`;
  return page({
    id: 'estimation',
    titre: 'Estimer mon prix : plomberie, chauffage, électricité | Simple Travaux (60)',
    description: 'Choisissez la pièce, cochez l’intervention : le total TTC s’affiche. WC, lavabo, douche, baignoire, cuisine, chauffe-eau, radiateurs, électricité, salle de bain PMR.',
    og: 'og-estimation', chemin: '/estimation', contenu,
  });
}

/* ---------- CONTACT ---------- */
function contact() {
  const contenu = `
<section class="contact-hero" data-section>
  <div class="wrap contact-hero__grille">
    <div class="contact-hero__texte">
      ${eyebrow('01', 'Contact')}
      <h1 class="titre-xl" data-split>Appelez <em>Pedro.</em></h1>
      <a class="numero-geant" href="${SITE.telHref}" data-goutte><span class="numero-geant__txt">${SITE.tel}</span><svg class="numero-geant__tuyau" viewBox="0 0 600 20" preserveAspectRatio="none" aria-hidden="true"><path d="M0 10 H600"/><path class="eau" d="M0 10 H600"/></svg></a>
      <p class="lead" data-apparait>Appel ou SMS, directement à l’artisan. Pour une fuite, une panne ou un projet, dans un rayon de ${SITE.rayonKm} km autour de ${SITE.ville}.</p>
      <div class="contact-hero__actions" data-apparait>
        <a class="btn btn--cuivre btn--grand" href="${SITE.telHref}" data-magnet>${ICONES.tel}<span>Appeler</span></a>
        <a class="btn btn--ligne btn--grand" href="${SITE.smsHref}" data-magnet>${ICONES.sms}<span>SMS</span></a>
        <a class="btn btn--ligne btn--grand" href="mailto:${SITE.email}" data-magnet>${ICONES.mail}<span>E-mail</span></a>
      </div>
      <dl class="infos" data-apparait>
        <div><dt class="mono">Horaires</dt><dd>Du lundi au samedi, 8h–19h <span class="voyant" data-voyant><i></i><span data-voyant-texte></span></span></dd></div>
        <div><dt class="mono">Urgences</dt><dd>Prise en charge rapide selon disponibilité</dd></div>
        <div><dt class="mono">E-mail</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div>
        <div><dt class="mono">Atelier</dt><dd>${SITE.ville} (${SITE.cp}), Oise</dd></div>
      </dl>
    </div>
    <figure class="contact-hero__visuel" data-cotes>
      <div class="contact-hero__photo" data-parallaxe>${img('camionnette', 'Utilitaire blanc aux portes ouvertes sur des étagères d’outils, devant une maison en pierre', { sizes: '(max-width: 900px) 100vw, 50vw', eager: true })}</div>
      <svg class="cotes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="cote" d="M0 -4 H100"/><path class="cote" d="M-3 0 V100"/></svg>
      <div class="contact-hero__vignette">${img('plombier-sous-evier', 'Plombier intervenant sous un évier', { sizes: '240px' })}</div>
    </figure>
  </div>
</section>

<section class="rdv" id="rendez-vous" data-section data-masque-barre>
  <div class="wrap rdv__grille">
    <div class="rdv__texte">
      ${eyebrow('02', 'Rendez-vous')}
      <h2 class="titre-l" data-split>Choisissez un créneau.</h2>
      <p data-apparait>Indiquez le jour qui vous arrange et le type d’intervention. Pedro confirme le rendez-vous par téléphone.</p>
      <figure class="rdv__photo" data-parallaxe>${img('chauffagiste-radiateur', 'Artisan contrôlant un radiateur avec un appareil de mesure', { sizes: '(max-width: 900px) 100vw, 35vw' })}</figure>
    </div>
    <form class="formulaire calendrier" data-form-simule="rdv" novalidate>
      <div class="calendrier__tete"><button type="button" class="cal-nav" data-cal-prec aria-label="Semaines précédentes">←</button><p class="calendrier__mois mono" data-cal-mois></p><button type="button" class="cal-nav" data-cal-suiv aria-label="Semaines suivantes">→</button></div>
      <div class="calendrier__grille" data-cal-grille role="group" aria-label="Jour du rendez-vous"></div>
      <div class="heures" data-heures role="group" aria-label="Créneau"></div>
      <fieldset class="types">
        <legend class="champ__label">Type d’intervention *</legend>
        ${['Plomberie', 'Chauffage', 'Électricité', 'Rénovation'].map((t) => `<label class="puce-case"><input type="checkbox" name="type" value="${t}"><span>${t}</span></label>`).join('')}
      </fieldset>
      <div class="champs">
        <label class="champ"><span class="champ__label">Nom *</span><input name="nom" autocomplete="name" required></label>
        <label class="champ"><span class="champ__label">Téléphone *</span><input name="tel" type="tel" autocomplete="tel" required inputmode="tel"></label>
        <label class="champ"><span class="champ__label">Ville / code postal *</span><input name="ville" required></label>
        <label class="champ"><span class="champ__label">E-mail</span><input name="email" type="email" autocomplete="email"></label>
      </div>
      <p class="rgpd">Vos coordonnées servent uniquement à organiser le rendez-vous. Elles ne sont ni cédées ni vendues. <a href="mentions-legales.html#confidentialite">Politique de confidentialité</a> (à compléter).</p>
      <button class="btn btn--cuivre btn--grand" type="submit">Demander ce rendez-vous ${ICONES.fleche}</button>
      <p class="petit mono">Maquette : créneaux de démonstration, demande simulée.</p>
      <div class="confirmation" data-confirmation hidden tabindex="-1"></div>
    </form>
  </div>
</section>

<section class="zone sombre zone--contact" id="zone" data-section>
  <div class="zone__fond" aria-hidden="true">${img('riviere', '', { sizes: '100vw', cls: 'zone__fond-img' })}</div>
  <div class="wrap zone__grille">
    <div class="zone__texte">
      ${eyebrow('03', 'Zone d’intervention', true)}
      <h2 class="titre-l" data-split>Votre commune est-elle couverte&nbsp;?</h2>
      <p data-apparait>Rayon de ${SITE.rayonKm} km autour de ${SITE.ville}. En dehors, appelez : Pedro vous dira franchement si le déplacement est possible.</p>
      <div class="secteurs" data-apparait>${listeCommunes()}</div>
      <p class="petit mono" data-apparait>Carte schématique · distances à vol d’oiseau, approximatives.</p>
    </div>
    <figure class="zone__carte" data-carte>
      ${carte()}
      <figcaption class="zone__info mono" data-carte-info aria-live="polite">Survolez une commune</figcaption>
    </figure>
  </div>
</section>

<section class="message" id="message" data-section data-masque-barre>
  <div class="wrap message__grille">
    <div class="message__texte">
      ${eyebrow('04', 'Message')}
      <h2 class="titre-l" data-split>Une question, un projet&nbsp;?</h2>
      <p data-apparait>Décrivez votre besoin, Pedro vous répond.</p>
      <figure class="message__photo" data-cotes>${img('evier-cuisine', 'Évier de cuisine avec mitigeur et plan en bois', { sizes: '(max-width: 900px) 100vw, 35vw' })}<svg class="cotes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="cote" d="M0 104 H100"/></svg></figure>
    </div>
    <form class="formulaire" data-form-simule="message" novalidate>
      <div class="champs">
        <label class="champ"><span class="champ__label">Nom *</span><input name="nom" autocomplete="family-name" required></label>
        <label class="champ"><span class="champ__label">Prénom</span><input name="prenom" autocomplete="given-name"></label>
        <label class="champ"><span class="champ__label">Téléphone *</span><input name="tel" type="tel" autocomplete="tel" required inputmode="tel"></label>
        <label class="champ"><span class="champ__label">Ville / code postal *</span><input name="ville" required></label>
        <label class="champ champ--large"><span class="champ__label">E-mail *</span><input name="email" type="email" autocomplete="email" required></label>
      </div>
      <fieldset class="types">
        <legend class="champ__label">Type d’intervention *</legend>
        ${['Plomberie', 'Chauffage', 'Électricité', 'Rénovation'].map((t) => `<label class="puce-case"><input type="checkbox" name="type" value="${t}"><span>${t}</span></label>`).join('')}
      </fieldset>
      <label class="champ champ--large"><span class="champ__label">Votre message</span><textarea name="message" rows="5" maxlength="1200"></textarea></label>
      <p class="rgpd">Vos coordonnées servent uniquement à traiter votre demande et à vous recontacter. Elles ne sont ni cédées ni vendues. <a href="mentions-legales.html#confidentialite">Politique de confidentialité</a> (à compléter).</p>
      <button class="btn btn--cuivre btn--grand" type="submit">Envoyer ${ICONES.fleche}</button>
      <p class="petit mono">Maquette : l’envoi est simulé, aucune donnée n’est transmise.</p>
      <div class="confirmation" data-confirmation hidden tabindex="-1"></div>
    </form>
  </div>
</section>`;
  return page({
    id: 'contact',
    titre: 'Contact et rendez-vous : plombier à Longueil-Sainte-Marie (60) | Simple Travaux',
    description: 'Appelez Pedro au 07 61 18 33 22, du lundi au samedi de 8h à 19h. Rendez-vous, message, zone d’intervention de 30 km autour de Longueil-Sainte-Marie.',
    og: 'og-contact', chemin: '/contact', contenu,
  });
}

/* ---------- MENTIONS ---------- */
function mentions() {
  const ac = '<span class="a-completer-txt">à compléter</span>';
  let contenu = `
<section class="legal" data-section>
  <div class="wrap legal__grille">
  <div class="legal__in">
    ${eyebrow('01', 'Informations légales')}
    <h1 class="titre-l">Mentions légales et confidentialité</h1>
    <p class="petit mono">Maquette : les informations absentes du site actuel sont signalées « à compléter ».</p>
    <h2 class="titre-s">Éditeur du site</h2>
    <dl class="legal__liste">
      <div><dt>Nom commercial</dt><dd>Simple Travaux</dd></div>
      <div><dt>Exploitant (nom et prénom)</dt><dd>${ac}</dd></div>
      <div><dt>Statut juridique</dt><dd>${ac}</dd></div>
      <div><dt>Numéro d’immatriculation (RNE / SIRET)</dt><dd>${ac}</dd></div>
      <div><dt>TVA intracommunautaire</dt><dd>${ac}</dd></div>
      <div><dt>Activité</dt><dd>Artisan plombier et travaux de rénovation</dd></div>
      <div><dt>Siège</dt><dd>${SITE.ville} (${SITE.cp}), France — adresse ${ac}</dd></div>
      <div><dt>Téléphone</dt><dd><a href="${SITE.telHref}">${SITE.tel}</a></dd></div>
      <div><dt>E-mail</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div>
      <div><dt>Directeur de la publication</dt><dd>${ac}</dd></div>
      <div><dt>Assurance professionnelle</dt><dd>Assureur et zone de couverture ${ac}</dd></div>
    </dl>
    <h2 class="titre-s">Hébergement</h2>
    <p>Site actuel : OVH SAS, 2 rue Kellermann, 59100 Roubaix, France. Maquette : Vercel Inc., coordonnées ${ac} lors de la mise en ligne.</p>
    <h2 class="titre-s">Propriété intellectuelle</h2>
    <p>L’ensemble des contenus (textes, images, graphismes) présents sur le site sont la propriété de Simple Travaux, sauf mention contraire. Toute reproduction, totale ou partielle, est interdite sans autorisation expresse.</p>
    <h2 class="titre-s" id="confidentialite">Protection des données personnelles</h2>
    <p>Les informations collectées via les formulaires (nom, téléphone, e-mail, adresse) sont uniquement utilisées pour traiter votre demande et vous recontacter. Elles ne sont jamais cédées ni vendues à des tiers.</p>
    <p>Conformément au RGPD, vous disposez d’un droit d’accès, de rectification et de suppression de vos données en écrivant à <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
    <p>Durée de conservation, base légale du traitement, sous-traitants éventuels et cookies : ${ac}.</p>
  </div>
  <aside class="legal__fiche" aria-label="Récapitulatif pour la mise en ligne">
    <svg class="legal__picto" viewBox="0 0 220 170" aria-hidden="true">
      <path class="lp-grille" d="M0 34H220M0 68H220M0 102H220M0 136H220M44 0V170M88 0V170M132 0V170M176 0V170"/>
      <path class="lp-cuivre" d="M24 52 H196 M110 52 V150"/>
      <path class="lp-eau" d="M24 52 H196 M110 52 V150"/>
      <rect class="lp-raccord" x="12" y="36" width="16" height="32" rx="2"/><rect class="lp-raccord" x="192" y="36" width="16" height="32" rx="2"/>
      <path class="lp-cote" d="M24 18 H196 M24 12 V24 M196 12 V24"/>
    </svg>
    <p class="mono legal__fiche-titre">Planche 00 · Informations légales</p>
    <p class="legal__compte"><b>__NB_AC__</b> informations à compléter avec Pedro avant la mise en ligne.</p>
    <ul class="legal__contacts">
      <li><span class="mono">Téléphone</span><a href="${SITE.telHref}">${SITE.tel}</a></li>
      <li><span class="mono">E-mail</span><a href="mailto:${SITE.email}">${SITE.email}</a></li>
      <li><span class="mono">Atelier</span>${SITE.ville} (${SITE.cp})</li>
    </ul>
  </aside>
  </div>
</section>`;
  const nbAc = contenu.split(ac).length - 1;
  contenu = contenu.replace('__NB_AC__', String(nbAc));
  return page({
    id: 'mentions', titre: 'Mentions légales et confidentialité | Simple Travaux',
    description: 'Mentions légales et politique de confidentialité du site Simple Travaux, artisan plombier à Longueil-Sainte-Marie (60).',
    og: 'og-accueil', chemin: '/mentions-legales', contenu,
  });
}

/* ---------- 404 ---------- */
function erreur() {
  const root = '/';
  const contenu = `
<section class="e404" data-section>
  <div class="e404__fond" aria-hidden="true">${img('fuite-404', '', { sizes: '100vw', root })}</div>
  <div class="wrap e404__in">
    <svg class="e404__tuyau" viewBox="0 0 600 160" aria-hidden="true"><path class="e404__cuivre" d="M0 40 H260 Q300 40 300 80 V100"/><circle class="e404__joint" cx="300" cy="104" r="9"/></svg>
    <div class="e404__flaque" data-flaque aria-hidden="true"></div>
    <p class="eyebrow"><span class="vanne" aria-hidden="true"><i></i></span><span class="mono">404</span><span>Fuite détectée</span></p>
    <h1 class="titre-xl">Cette page <em>n’existe pas.</em></h1>
    <p class="lead">Le lien est peut-être ancien. Le réseau, lui, fonctionne toujours.</p>
    <div class="hero__cta"><a class="btn btn--cuivre btn--grand" href="/">Retour à l’accueil ${ICONES.fleche}</a><a class="btn btn--ligne btn--grand" href="${SITE.telHref}">${ICONES.tel}<span>${SITE.tel}</span></a></div>
  </div>
</section>`;
  return page({ id: 'e404', titre: 'Page introuvable | Simple Travaux', description: 'Cette page n’existe pas.', og: 'og-accueil', chemin: '/404', contenu, root });
}

const out = new URL('../', import.meta.url);
writeFileSync(new URL('index.html', out), accueil());
writeFileSync(new URL('estimation.html', out), estimation());
writeFileSync(new URL('contact.html', out), contact());
writeFileSync(new URL('mentions-legales.html', out), mentions());
writeFileSync(new URL('404.html', out), erreur());
console.log('pages générées, version', V);
