/* Page Prestations : les six métiers du collecteur, les symptômes du diagnostic
   et les familles d'intervention du catalogue. Tous les tarifs viennent de tarifs.js. */

export const METIERS = [
  {
    id: 'depannage', nom: 'Dépannage & fuites', court: 'Dépannage', pieces: ['depannage'], img: 'depannage-fuite-seau',
    alt: 'Seau bleu sous une évacuation qui goutte',
    intro: 'Fuites, débouchages, vannes, pression d’eau et dépannages courants.',
    vedettes: ['dep-fuite-visible', 'dep-vanne', 'dep-debouchage', 'dep-fuite-cachee'],
  },
  {
    id: 'sanitaires', nom: 'Sanitaires', court: 'Sanitaires', pieces: ['wc', 'lavabo', 'douche', 'baignoire', 'cuisine'], img: 'salle-de-bain-double-vasque',
    alt: 'Salle de bain claire avec meuble double vasque',
    intro: 'WC, lavabo, douche, baignoire et évier : réparer, remplacer ou rénover l’équipement.',
    vedettes: ['wc-debouchage', 'lav-robinet', 'dou-mitigeur', 'wc-suspendu'],
  },
  {
    id: 'chauffe-eau', nom: 'Chauffe-eau', court: 'Chauffe-eau', pieces: ['chauffe-eau'], img: 'chauffe-eau',
    alt: 'Chauffe-eau électrique mural dans une buanderie claire',
    intro: 'Remplacement ou entretien de votre ballon d’eau chaude électrique.',
    vedettes: ['ce-panne', 'ce-groupe', 'ce-100', 'ce-200'],
  },
  {
    id: 'chauffage', nom: 'Radiateurs & chauffage', court: 'Chauffage', pieces: ['radiateurs'], img: 'chauffagiste-radiateur',
    alt: 'Chauffagiste agenouillé devant un radiateur sèche-serviettes',
    intro: 'Fuite, désembouage, remplacement ou déplacement de radiateur à eau.',
    vedettes: ['rad-chauffe-mal', 'rad-desembouage', 'rad-robinet', 'rad-remplacement'],
  },
  {
    id: 'electricite', nom: 'Électricité', court: 'Électricité', pieces: ['electricite'], img: 'electricien-tableau',
    alt: 'Électricien intervenant sur un tableau électrique',
    intro: 'Recherche de panne, tableau, prises, luminaires et raccordements.',
    vedettes: ['el-prise', 'el-luminaire', 'el-panne', 'el-tableau'],
  },
  {
    id: 'pmr', nom: 'Salle de bain PMR', court: 'PMR', pieces: ['pmr'], img: 'pmr',
    alt: 'Salle de bain accessible avec douche de plain-pied et barres d’appui',
    intro: 'Adapter la salle de bain pour l’autonomie des personnes à mobilité réduite et des seniors.',
    vedettes: ['pmr-barres', 'pmr-mitigeur', 'pmr-siege', 'pmr-douche'],
  },
];

/* familles d'intervention : regroupement des intitulés de groupes du site */
export const FAMILLES = [
  { id: 'depanner', nom: 'Dépanner' },
  { id: 'remplacer', nom: 'Remplacer & installer' },
  { id: 'transformer', nom: 'Transformer & adapter' },
];
export const FAMILLE_DE_GROUPE = {
  'Dépanner': 'depanner',
  'Remplacer': 'remplacer',
  'Remplacer ou déplacer': 'remplacer',
  'Installer': 'remplacer',
  'Lave-linge & lave-vaisselle': 'remplacer',
  'Transformer': 'transformer',
  'Adapter': 'transformer',
};

/* symptômes : chaque règle reçoit une prestation { id, piece, groupe } */
const EAU_CHAUDE = ['ce-panne', 'ce-groupe', 'ce-reducteur', 'ce-50', 'ce-100', 'ce-150', 'ce-200'];
export const SYMPTOMES = [
  { id: 'fuit', nom: 'Ça fuit', img: 'fuite-macro', alt: 'Goutte d’eau au bout d’un tuyau de cuivre',
    test: (p) => /fuite/.test(p.id) || p.id === 'ce-groupe' },
  { id: 'bouche', nom: 'C’est bouché', img: 'evier-cuisine', alt: 'Évier de cuisine en inox',
    test: (p) => /debouchage|engorgement/.test(p.id) },
  { id: 'eau-chaude', nom: 'Plus d’eau chaude', img: 'chauffe-eau', alt: 'Chauffe-eau électrique mural',
    test: (p) => EAU_CHAUDE.includes(p.id) },
  { id: 'chauffe-mal', nom: 'Ça chauffe mal', img: 'piece-radiateur', alt: 'Radiateur blanc sous une fenêtre',
    test: (p) => p.piece === 'radiateurs' && (p.groupe === 'Dépanner' || ['rad-robinet', 'rad-remplacement'].includes(p.id)) },
  { id: 'courant', nom: 'Plus de courant', img: 'piece-electricite', alt: 'Tableau électrique ouvert',
    test: (p) => p.piece === 'electricite' && (p.groupe === 'Dépanner' || p.id === 'el-tableau') },
  { id: 'changer', nom: 'Je veux changer', img: 'wc-suspendu-salle', alt: 'Petite salle de bain avec WC suspendu',
    test: (p) => p.piece !== 'pmr' && FAMILLE_DE_GROUPE[p.groupe] === 'remplacer' },
  { id: 'adapter', nom: 'Je veux adapter', img: 'pmr', alt: 'Salle de bain adaptée aux personnes à mobilité réduite',
    test: (p) => p.piece === 'pmr' || ['wc-pmr', 'dou-italienne', 'bai-douche'].includes(p.id) },
];
