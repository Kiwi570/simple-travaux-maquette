/* Compteur d'eau à rouleaux : les chiffres tournent comme sur un compteur réel. */
import { env, gsap, qsa } from './env.js?v=2';
import { euros } from '../data/tarifs.js?v=2';

const CHIFFRES = 5;

class Compteur {
  constructor(el) {
    this.el = el;
    this.cadran = el.querySelector('[data-compteur-cadran]');
    this.texte = el.querySelector('[data-compteur-texte]');
    this.valeur = Number(el.dataset.valeur || 0);
    this.etat = { v: this.valeur };
    this.rouleaux = [];
    this.construire();
    this.afficher(this.valeur, this.valeur);
  }

  construire() {
    this.cadran.textContent = '';
    for (let i = CHIFFRES - 1; i >= 0; i--) {
      const r = document.createElement('span');
      r.className = 'rouleau' + (i === 0 ? '' : '');
      const bande = document.createElement('span');
      bande.className = 'rouleau__bande';
      for (let k = 0; k <= 10; k++) {
        const s = document.createElement('span');
        s.textContent = String(k % 10);
        bande.appendChild(s);
      }
      r.appendChild(bande);
      this.cadran.appendChild(r);
      this.rouleaux.unshift({ r, bande });
      if (i === 3) {
        const sep = document.createElement('span');
        sep.className = 'compteur__sep';
        this.cadran.appendChild(sep);
      }
    }
  }

  afficher(v, cible) {
    const entier = Math.max(0, v);
    this.rouleaux.forEach(({ r, bande }, i) => {
      const p = Math.pow(10, i);
      let pos = Math.floor(entier / p) % 10;
      if (i === 0) pos = entier % 10;
      else {
        const reste = entier % p;
        const retenue = Math.max(0, reste - (p - 1)); // n'avance que pendant le dernier passage de 9 à 0
        pos += retenue;
      }
      bande.style.transform = `translate3d(0, ${(-pos * 1.18).toFixed(4)}em, 0)`;
      const significatif = cible >= p || (i === 0);
      r.classList.toggle('zero', !significatif);
    });
  }

  set(valeur, { instant = false } = {}) {
    valeur = Math.max(0, Math.round(valeur));
    if (this.texte) this.texte.textContent = euros(valeur);
    this.el.dataset.valeur = String(valeur);
    if (this.tween) this.tween.kill();
    if (instant || !env.anim || !gsap) {
      this.etat.v = valeur; this.afficher(valeur, valeur); return;
    }
    const ecart = Math.abs(valeur - this.etat.v);
    this.tween = gsap.fromTo(this.etat, { v: this.etat.v }, {
      v: valeur,
      duration: Math.min(1.7, 0.7 + Math.log10(ecart + 1) * 0.28),
      ease: 'power3.out',
      onUpdate: () => this.afficher(this.etat.v, valeur),
      onComplete: () => this.afficher(valeur, valeur),
    });
  }
}

export function initCompteurs() {
  qsa('[data-compteur]').forEach((el) => { el.__compteur = new Compteur(el); });
}

export function compteurDe(el) { return el && el.__compteur; }
