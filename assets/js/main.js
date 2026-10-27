/* Simple Travaux — maquette « Le Réseau » : point d'entrée. */
import { env, html, gsap, ScrollTrigger, qs, mesurer, policesPretes } from './modules/env.js?v=2';
import { initDefilement, defilerVers } from './modules/defilement.js?v=2';
import { ouvrir } from './modules/ouverture.js?v=2';
import { initTransitions, entree } from './modules/transitions.js?v=2';
import { initMenu, initCalme, restaurerPosition, initVoyants, initBarre } from './modules/entete.js?v=2';
import { initCompteurs } from './modules/compteur.js?v=2';
import { initApparitions } from './modules/apparitions.js?v=2';
import { initMagnetiques, initInclinaisons, initCurseur } from './modules/interactions.js?v=2';
import { initReseau } from './modules/reseau.js?v=2';
import { initCoupe } from './modules/coupe.js?v=2';
import { initDefile, initGouttes } from './modules/urgence.js?v=2';
import { initHorizontal } from './modules/horizontal.js?v=2';
import { initEtapes } from './modules/etapes.js?v=2';
import { initDemo } from './modules/demo.js?v=2';
import { initCarte } from './modules/carte.js?v=2';
import { initEstimateur } from './modules/estimateur.js?v=2';
import { initFormulaires } from './modules/formulaires.js?v=2';
import { init404 } from './modules/erreur.js?v=2';

async function demarrer() {
  mesurer();
  initMenu();
  initCalme();
  initVoyants();
  initBarre();
  initCompteurs();
  initFormulaires();
  initEstimateur();
  initDemo();
  initTransitions();

  await policesPretes(1100);
  mesurer();
  html.classList.remove('charge');

  initDefilement();
  const intro = html.classList.contains('entree') ? entree() : ouvrir();
  window.__stIntro = intro;

  // ordre du document : les sections épinglées d'abord
  initHorizontal();
  initEtapes();
  initApparitions(intro);
  initCoupe(intro);
  initDefile();
  initGouttes();
  initCarte();
  init404(intro);
  initMagnetiques();
  initInclinaisons();
  initCurseur();
  initReseau();

  restaurerPosition();

  // WebGL chargé après l'ouverture, seulement si l'appareil le permet
  if (env.anim) {
    intro.then(() => new Promise((r) => setTimeout(r, 2200))).then(() => {
      const essai = document.createElement('canvas');
      const ok = !!(essai.getContext('webgl2') || essai.getContext('webgl'));
      if (!ok) return;
      if (qs('[data-gl-flux]')) import('./modules/gl-flux.js?v=2').then((m) => m.initFlux(Promise.resolve())).catch(() => {});
      if (qs('[data-ripple]') && env.fin) import('./modules/gl-ondes.js?v=2').then((m) => m.initOndes()).catch(() => {});
    });
    // ?piece=… : l'estimateur s'ouvre sur la pièce demandée
    const est = qs('[data-estimateur]');
    if (est && new URLSearchParams(location.search).get('piece')) intro.then(() => setTimeout(() => defilerVers(qs('#estimateur')), 300));
    else if (location.hash && qs(location.hash)) intro.then(() => setTimeout(() => defilerVers(qs(location.hash)), 300));
  }

  // recalcul une fois les images chargées
  window.addEventListener('load', () => { mesurer(); if (ScrollTrigger) ScrollTrigger.refresh(); if (window.__stLenis) window.__stLenis.resize(); });
  window.__stPret = true;
}

demarrer();
