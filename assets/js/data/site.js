/* Données de l'entreprise, reprises du site actuel simple-travaux.fr.
   Tout ce qui manque sur le site est marqué « à compléter ». */

export const SITE = {
  nom: 'Simple Travaux',
  artisan: 'Pedro',
  tel: '07 61 18 33 22',
  telHref: 'tel:+33761183322',
  smsHref: 'sms:+33761183322',
  email: 'bati75pro@gmail.com',
  ville: 'Longueil-Sainte-Marie',
  cp: '60126',
  rayonKm: 30,
  // Du lundi (1) au samedi (6), 8h à 19h, heure de Paris (page contact du site)
  horaires: { jours: [1, 2, 3, 4, 5, 6], debut: 8, fin: 19 },
};

/* Conditions affichées sur le site actuel (pages baignoire, PMR, chauffe-eau…).
   L'arrêté du 24 janvier 2017 demande un taux horaire affiché TTC : à compléter. */
export const CONDITIONS = [
  { label: 'Déplacement (rayon de 30 km)', valeur: '50,00 € HT', note: 'Montant TTC à compléter' },
  { label: 'Main-d’œuvre', valeur: '55,00 € HT / heure', note: 'Montant TTC à compléter' },
  { label: 'Devis à domicile et conseils', valeur: 'Gratuit', note: 'Sans engagement' },
];

/* Communes citées sur le site (accueil, page Longueil-Sainte-Marie, Qui sommes-nous).
   Coordonnées approximatives, carte schématique. */
export const CENTRE = { nom: 'Longueil-Sainte-Marie', lat: 49.3567, lon: 2.7181 };
export const COMMUNES = [
  { nom: 'Compiègne', lat: 49.4179, lon: 2.8261, secteur: 'Compiègne & Verberie', grande: true },
  { nom: 'Margny-lès-Compiègne', lat: 49.4256, lon: 2.8200, secteur: 'Compiègne & Verberie' },
  { nom: 'Le Meux', lat: 49.3667, lon: 2.7444, secteur: 'Compiègne & Verberie' },
  { nom: 'Rivecourt', lat: 49.3450, lon: 2.7350, secteur: 'Compiègne & Verberie' },
  { nom: 'Chevrières', lat: 49.3456, lon: 2.6831, secteur: 'Compiègne & Verberie' },
  { nom: 'Verberie', lat: 49.3111, lon: 2.7317, secteur: 'Compiègne & Verberie' },
  { nom: 'Béthisy-Saint-Pierre', lat: 49.3036, lon: 2.7961, secteur: 'Compiègne & Verberie' },
  { nom: 'Pont-Sainte-Maxence', lat: 49.3017, lon: 2.6044, secteur: 'Creil & Senlis', grande: true },
  { nom: 'Les Ageux', lat: 49.3158, lon: 2.5953, secteur: 'Creil & Senlis' },
  { nom: 'Creil', lat: 49.2597, lon: 2.4747, secteur: 'Creil & Senlis', grande: true },
  { nom: 'Nogent-sur-Oise', lat: 49.2717, lon: 2.4683, secteur: 'Creil & Senlis' },
  { nom: 'Montataire', lat: 49.2569, lon: 2.4386, secteur: 'Creil & Senlis' },
  { nom: 'Senlis', lat: 49.2072, lon: 2.5867, secteur: 'Creil & Senlis', grande: true },
  { nom: 'Chantilly', lat: 49.1947, lon: 2.4711, secteur: 'Creil & Senlis' },
  { nom: 'Clermont', lat: 49.3786, lon: 2.4128, secteur: 'Clermont & Crépy-en-Valois', grande: true },
  { nom: 'Liancourt', lat: 49.3306, lon: 2.4664, secteur: 'Clermont & Crépy-en-Valois' },
  { nom: 'Crépy-en-Valois', lat: 49.2344, lon: 2.8886, secteur: 'Clermont & Crépy-en-Valois', grande: true },
];
/* Tracé schématique de l'Oise, du nord-est au sud-ouest */
export const OISE = [
  [49.445, 2.865], [49.420, 2.830], [49.402, 2.792], [49.378, 2.758], [49.352, 2.738],
  [49.322, 2.731], [49.306, 2.690], [49.300, 2.612], [49.287, 2.540], [49.263, 2.482],
  [49.252, 2.440], [49.232, 2.392],
];

/* Distance à vol d'oiseau (km), approximation équirectangulaire */
export function distanceKm(a, b) {
  const R = 6371, rad = Math.PI / 180;
  const x = (b.lon - a.lon) * rad * Math.cos(((a.lat + b.lat) / 2) * rad);
  const y = (b.lat - a.lat) * rad;
  return Math.sqrt(x * x + y * y) * R;
}
