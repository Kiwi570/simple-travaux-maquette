/* Grilles tarifaires reprises à l'identique des tableaux « Tarif indicatif (TTC) »
   du site actuel (pages Estimation). prix = euros TTC ; null = sur devis.
   Une seule ligne vient du formulaire du site faute de tableau : lavabo,
   « Fuite sur évacuation d'eau » (150 €). */

export const PIECES = [
  {
    id: 'wc', nom: 'WC & toilettes', court: 'WC', img: 'wc-classique',
    intro: 'Pose, remplacement ou réparation de WC posés ou suspendus.',
    groupes: [
      { titre: 'Dépanner', items: [
        { id: 'wc-debouchage', nom: 'Débouchage simple', desc: 'Intervention pour déboucher la cuvette des WC et rétablir un écoulement normal.', prix: 120 },
        { id: 'wc-chasse', nom: 'Remplacement d’une chasse d’eau', desc: 'Dépose de l’ancien mécanisme et pose d’un système de chasse d’eau neuf.', prix: 180 },
        { id: 'wc-fuite-reservoir', nom: 'Fuite sur réservoir', desc: 'Recherche, réparation de fuite ou remplacement des joints du réservoir.', prix: 120 },
        { id: 'wc-fuite-arrivee', nom: 'Fuite sur arrivée d’eau', desc: 'Réparation du robinet d’arrêt ou du flexible d’alimentation d’eau.', prix: 130 },
        { id: 'wc-fuite-evac', nom: 'Fuite sur évacuation', desc: 'Réparation ou remplacement de la pipe d’évacuation.', prix: 180 },
        { id: 'wc-broyeur', nom: 'Panne sur broyeur ou pompe de relevage', desc: 'Diagnostic et dépannage sur le mécanisme du sanibroyeur ou de la pompe.', prix: 150 },
      ] },
      { titre: 'Remplacer', items: [
        { id: 'wc-standard', nom: 'WC standard', desc: 'Dépose de l’ancien WC et pose d’une cuvette au sol standard neuve.', prix: 450, img: 'equip-wc-standard' },
        { id: 'wc-pmr', nom: 'WC PMR', desc: 'Installation d’une cuvette réhaussée, adaptée aux personnes à mobilité réduite.', prix: 750 },
        { id: 'wc-suspendu', nom: 'WC suspendu', desc: 'Pose d’un bâti-support encastré et installation d’une cuvette suspendue neuve.', prix: 1000, img: 'equip-wc-suspendu' },
      ] },
    ],
  },
  {
    id: 'lavabo', nom: 'Lavabo & vasque', court: 'Lavabo', img: 'lavabo-meuble',
    intro: 'Remplacement de robinetterie, installation de meuble vasque.',
    groupes: [
      { titre: 'Dépanner', items: [
        { id: 'lav-debouchage', nom: 'Débouchage lavabo / évacuation', desc: 'Déboucher un lavabo ou une évacuation.', prix: 120 },
        { id: 'lav-robinet', nom: 'Remplacement du robinet', desc: 'Remplacer un robinet ou un mitigeur.', prix: 180 },
        { id: 'lav-siphon', nom: 'Remplacement du siphon', desc: 'Remplacer le siphon du lavabo.', prix: 120 },
        { id: 'lav-fuite-alim', nom: 'Fuite sur alimentation en eau', desc: 'Rechercher et réparer une fuite sur l’alimentation en eau.', prix: 150 },
        { id: 'lav-fuite-evac', nom: 'Fuite sur évacuation d’eau', desc: 'Réparer une fuite sur l’évacuation.', prix: 150 },
        { id: 'lav-fixation', nom: 'Fixation du lavabo', desc: 'Refixer un lavabo.', prix: 150 },
      ] },
      { titre: 'Remplacer', items: [
        { id: 'lav-colonne', nom: 'Lavabo + colonne', desc: 'Installation d’un lavabo avec colonne et raccordements standards.', prix: 450, img: 'equip-lavabo-colonne' },
        { id: 'lav-meuble', nom: 'Meuble vasque', desc: 'Fourniture et pose d’un meuble vasque avec raccordements standards.', prix: 650, img: 'equip-meuble-vasque' },
        { id: 'lav-tuyauterie', nom: 'Modification de tuyauterie', desc: 'Modification standard des réseaux eau chaude, eau froide et évacuation.', prix: 250 },
      ] },
    ],
  },
  {
    id: 'douche', nom: 'Douche', court: 'Douche', img: 'douche-cabine',
    intro: 'Pose de cabine, receveur ou colonne de douche.',
    groupes: [
      { titre: 'Dépanner', items: [
        { id: 'dou-debouchage', nom: 'Débouchage douche', desc: 'Intervention pour déboucher la bonde et l’évacuation de la douche.', prix: 120 },
        { id: 'dou-mitigeur', nom: 'Remplacement du mitigeur', desc: 'Dépose du mélangeur ou mitigeur actuel et pose d’un robinet neuf.', prix: 250 },
        { id: 'dou-vidage', nom: 'Remplacement du système de vidage', desc: 'Changement de la bonde de douche et des raccords sous receveur.', prix: 180 },
        { id: 'dou-fuite-alim', nom: 'Fuite sur alimentation en eau', desc: 'Réparation de la fuite sur les canalisations d’arrivée d’eau chaude ou froide.', prix: 180 },
        { id: 'dou-fuite-evac', nom: 'Fuite sur évacuation d’eau', desc: 'Intervention et réparation sur le conduit d’évacuation de la douche.', prix: 155 },
        { id: 'dou-joints', nom: 'Réfection des joints silicone', desc: 'Dépose de l’ancien joint dégradé et pose d’un joint silicone d’étanchéité neuf.', prix: 150 },
      ] },
      { titre: 'Remplacer', items: [
        { id: 'dou-bac-80', nom: 'Receveur 80 × 80 cm', desc: 'Fourniture et pose d’un receveur de douche carré 80 × 80 cm.', prix: 650, img: 'equip-douche-paroi' },
        { id: 'dou-bac-90', nom: 'Receveur 90 × 90 cm', desc: 'Fourniture et pose d’un receveur de douche carré 90 × 90 cm.', prix: 750 },
        { id: 'dou-bac-80-120', nom: 'Receveur 80 × 120 cm', desc: 'Fourniture et pose d’un receveur de douche rectangulaire 80 × 120 cm.', prix: 850 },
        { id: 'dou-paroi-80', nom: 'Paroi de douche 80 × 80 cm', desc: 'Pose d’une paroi de protection ou vitrage de douche 80 × 80 cm.', prix: 600, img: 'equip-cabine-douche' },
        { id: 'dou-paroi-90', nom: 'Paroi de douche 90 × 90 cm', desc: 'Pose d’une paroi de protection ou vitrage de douche 90 × 90 cm.', prix: 650 },
        { id: 'dou-paroi-120', nom: 'Paroi de douche 120 cm', desc: 'Pose d’une paroi vitrée de douche fixe ou coulissante de 120 cm.', prix: 700 },
      ] },
      { titre: 'Transformer', items: [
        { id: 'dou-colonne', nom: 'Colonne de douche (ou barre et douchette)', desc: 'Dépose de l’ancien équipement et pose d’une colonne de douche neuve.', prix: 300 },
        { id: 'dou-italienne', nom: 'Douche à l’italienne (receveur à carreler)', desc: 'Rénovation complète ou création d’une douche à l’italienne de plain-pied.', prix: 4500, img: 'equip-douche-italienne' },
      ] },
    ],
  },
  {
    id: 'baignoire', nom: 'Baignoire', court: 'Baignoire', img: 'baignoire',
    intro: 'Installation, changement ou rénovation de baignoire.',
    groupes: [
      { titre: 'Dépanner', items: [
        { id: 'bai-debouchage', nom: 'Débouchage baignoire / évacuation', desc: 'Intervention pour déboucher l’évacuation et rétablir l’écoulement.', prix: 140 },
        { id: 'bai-robinet', nom: 'Remplacement du robinet (ou mitigeur)', desc: 'Dépose de l’ancien robinet et pose d’un nouveau mitigeur de baignoire.', prix: 200 },
        { id: 'bai-vidange', nom: 'Remplacement du système de vidange', desc: 'Changement de la bonde, du siphon et du mécanisme de vidange.', prix: 180 },
        { id: 'bai-fuite-alim', nom: 'Fuite sur alimentation en eau', desc: 'Recherche et réparation de fuite sur les arrivées d’eau chaude ou froide.', prix: 150 },
        { id: 'bai-fuite-evac', nom: 'Fuite sur évacuation d’eau', desc: 'Réparation de la tuyauterie ou des raccords d’évacuation sous la baignoire.', prix: 180 },
        { id: 'bai-joint', nom: 'Réfection du joint silicone', desc: 'Dépose des anciens joints et pose d’un joint d’étanchéité silicone neuf.', prix: 120 },
      ] },
      { titre: 'Remplacer', items: [
        { id: 'bai-120', nom: 'Baignoire droite 120 cm', desc: 'Fourniture et pose d’une baignoire droite de 120 cm.', prix: 900, img: 'equip-baignoire-encastree' },
        { id: 'bai-140', nom: 'Baignoire droite 140 cm', desc: 'Fourniture et pose d’une baignoire droite de 140 cm.', prix: 950 },
        { id: 'bai-160', nom: 'Baignoire droite 160 cm', desc: 'Fourniture et pose d’une baignoire droite de 160 cm.', prix: 1050 },
        { id: 'bai-170', nom: 'Baignoire droite 170 cm', desc: 'Fourniture et pose d’une baignoire droite de 170 cm.', prix: 1100 },
        { id: 'bai-tablier', nom: 'Tablier de baignoire', desc: 'Pose et habillage de baignoire avec tablier.', prix: 250 },
        { id: 'bai-barre', nom: 'Barre de douche, flexible et douchette', desc: 'Installation de l’ensemble douchette, barre murale et flexible.', prix: 180 },
      ] },
      { titre: 'Transformer', items: [
        { id: 'bai-douche', nom: 'Remplacement de la baignoire par une douche', desc: 'Dépose complète de la baignoire et installation d’un espace douche.', prix: 4500, img: 'equip-douche-paroi' },
        { id: 'bai-pare-bain', nom: 'Remplacement du pare-bain', desc: 'Dépose et pose d’un pare-bain vitré de protection.', prix: 300 },
      ] },
    ],
  },
  {
    id: 'cuisine', nom: 'Cuisine & évier', court: 'Cuisine', img: 'evier-cuisine',
    intro: 'Raccordement, pose ou dépannage de plomberie cuisine.',
    groupes: [
      { titre: 'Dépanner', items: [
        { id: 'cui-debouchage', nom: 'Débouchage évier', desc: 'Intervention pour déboucher l’évacuation de l’évier et rétablir l’écoulement.', prix: 120 },
        { id: 'cui-mitigeur', nom: 'Remplacement du robinet (ou mitigeur)', desc: 'Dépose de l’ancien robinet de cuisine et pose d’un nouveau mitigeur.', prix: 250 },
        { id: 'cui-vidange', nom: 'Remplacement du système de vidange', desc: 'Changement de la bonde, du siphon et du trop-plein de l’évier.', prix: 150 },
        { id: 'cui-fuite-alim', nom: 'Fuite sur alimentation en eau', desc: 'Réparation de fuite sur les arrivées ou flexibles d’eau chaude ou froide.', prix: 150 },
        { id: 'cui-fuite-evac', nom: 'Fuite sur évacuation d’eau', desc: 'Réparation ou remplacement des raccords et tuyaux d’évacuation.', prix: 150 },
        { id: 'cui-joint', nom: 'Réfection du joint silicone', desc: 'Dépose de l’ancien joint usé et pose d’un joint silicone d’étanchéité neuf.', prix: 120 },
      ] },
      { titre: 'Lave-linge & lave-vaisselle', items: [
        { id: 'cui-robinet-machine', nom: 'Remplacement du robinet machine', desc: 'Pose d’un nouveau robinet d’arrêt dédié au lave-linge ou lave-vaisselle.', prix: 130 },
        { id: 'cui-alim-machine', nom: 'Création d’une alimentation', desc: 'Repiquage et création d’une nouvelle arrivée d’eau pour l’électroménager.', prix: 250 },
        { id: 'cui-evac-machine', nom: 'Création d’une évacuation', desc: 'Raccordement et création d’une conduite d’évacuation dédiée.', prix: 250 },
      ] },
      { titre: 'Remplacer', items: [
        { id: 'cui-meuble-90', nom: 'Meuble sous-évier 90 cm', desc: 'Fourniture et pose d’un sous-évier de 90 cm de large.', prix: 750 },
        { id: 'cui-meuble-100', nom: 'Meuble sous-évier 100 cm', desc: 'Fourniture et pose d’un sous-évier de 100 cm de large.', prix: 800 },
        { id: 'cui-meuble-120', nom: 'Meuble sous-évier 120 cm', desc: 'Fourniture et pose d’un sous-évier de 120 cm de large.', prix: 900 },
        { id: 'cui-evier-90', nom: 'Évier 90 cm', desc: 'Dépose et pose d’un bac d’évier neuf de 90 cm de large.', prix: 400 },
        { id: 'cui-evier-100', nom: 'Évier 100 cm', desc: 'Dépose et pose d’un bac d’évier neuf de 100 cm de large.', prix: 450 },
        { id: 'cui-evier-120', nom: 'Évier 120 cm', desc: 'Dépose et pose d’un bac d’évier neuf de 120 cm de large.', prix: 500 },
      ] },
    ],
  },
  {
    id: 'chauffe-eau', nom: 'Chauffe-eau', court: 'Chauffe-eau', img: 'chauffe-eau',
    intro: 'Remplacement ou entretien de votre ballon d’eau chaude électrique.',
    groupes: [
      { titre: 'Dépanner', items: [
        { id: 'ce-panne', nom: 'Panne / vérification électrique', desc: 'Diagnostic électrique, contrôle du thermostat et de la résistance.', prix: 120 },
        { id: 'ce-fuite-alim', nom: 'Fuite sur alimentation en eau', desc: 'Réparation de la fuite sur les arrivées d’eau froide ou sorties d’eau chaude.', prix: 180 },
        { id: 'ce-fuite-evac', nom: 'Fuite sur évacuation d’eau', desc: 'Intervention sur la tuyauterie et les raccords d’évacuation du chauffe-eau.', prix: 150 },
        { id: 'ce-groupe', nom: 'Remplacement du groupe de sécurité', desc: 'Dépose de l’ancien groupe et pose d’un groupe de sécurité neuf.', prix: 220 },
        { id: 'ce-reducteur', nom: 'Remplacement du réducteur de pression', desc: 'Changement du réducteur de pression défectueux sur l’installation.', prix: 250 },
        { id: 'ce-reducteur-pose', nom: 'Installation d’un réducteur de pression', desc: 'Pose d’un réducteur de pression neuf pour protéger le ballon.', prix: 300 },
      ] },
      { titre: 'Remplacer', items: [
        { id: 'ce-50', nom: 'Ballon 50 L', desc: 'Dépose de l’ancien ballon et installation d’un chauffe-eau électrique de 50 litres.', prix: 700 },
        { id: 'ce-100', nom: 'Ballon 100 L', desc: 'Dépose de l’ancien ballon et installation d’un chauffe-eau électrique de 100 litres.', prix: 950 },
        { id: 'ce-150', nom: 'Ballon 150 L', desc: 'Dépose de l’ancien ballon et installation d’un chauffe-eau électrique de 150 litres.', prix: 1150 },
        { id: 'ce-200', nom: 'Ballon 200 L', desc: 'Dépose de l’ancien ballon et installation d’un chauffe-eau électrique de 200 litres.', prix: 1350 },
        { id: 'ce-trepied', nom: 'Trépied de chauffe-eau', desc: 'Fourniture et pose d’un trépied de support pour ballon vertical.', prix: 180 },
        { id: 'ce-tuyauterie', nom: 'Modification de tuyauterie', desc: 'Modification du réseau de canalisations pour s’adapter au nouveau chauffe-eau.', prix: 250 },
      ] },
    ],
  },
  {
    id: 'radiateurs', nom: 'Radiateurs & chauffage', court: 'Radiateurs', img: 'piece-radiateur',
    intro: 'Fuite, désembouage, remplacement ou déplacement de radiateur à eau.',
    groupes: [
      { titre: 'Dépanner', items: [
        { id: 'rad-chauffe-mal', nom: 'Radiateur qui chauffe mal', desc: 'Purge, contrôle de la vanne thermostatique et équilibrage du circuit.', prix: 120 },
        { id: 'rad-fuite', nom: 'Fuite sur radiateur', desc: 'Recherche, réparation de fuite ou remplacement des joints et raccords du radiateur.', prix: 150 },
        { id: 'rad-fuite-tuyau', nom: 'Fuite sur tuyau de chauffage', desc: 'Localisation et réparation par soudure ou raccord sur tuyauterie d’alimentation.', prix: 180 },
        { id: 'rad-desembouage', nom: 'Désembouage d’un radiateur', desc: 'Rinçage et nettoyage interne du radiateur encrassé.', prix: 150 },
      ] },
      { titre: 'Remplacer ou déplacer', items: [
        { id: 'rad-robinet', nom: 'Remplacement d’un robinet de radiateur', desc: 'Robinet classique ou thermostatique, avec vidange et remplissage.', prix: 180 },
        { id: 'rad-remplacement', nom: 'Remplacement d’un radiateur', desc: 'Dépose de l’ancien radiateur, pose du nouveau modèle et raccordement au réseau.', prix: 250 },
        { id: 'rad-deplacement', nom: 'Déplacement d’un radiateur', desc: 'Prolongation des tuyauteries et réinstallation du radiateur à un nouvel endroit.', prix: 350 },
        { id: 'rad-suppression', nom: 'Suppression d’un radiateur', desc: 'Vidange du circuit, dépose du radiateur et bouchonnage étanche de la tuyauterie.', prix: 150 },
      ] },
    ],
  },
  {
    id: 'electricite', nom: 'Électricité', court: 'Électricité', img: 'piece-electricite',
    intro: 'Recherche de panne, tableau, prises, luminaires et raccordements.',
    groupes: [
      { titre: 'Dépanner', items: [
        { id: 'el-panne', nom: 'Recherche de panne', desc: 'Diagnostic, vérification du tableau et remise en service.', prix: 90 },
        { id: 'el-securite', nom: 'Mise en sécurité / diagnostic global', desc: 'Contrôle complet de l’installation et rapport de préconisations.', prix: 120 },
        { id: 'el-normes', nom: 'Mise aux normes électriques', desc: 'Selon l’installation existante.', prix: null },
      ] },
      { titre: 'Installer', items: [
        { id: 'el-prise', nom: 'Remplacement de prise / interrupteur', desc: 'Dépose de l’ancien, fourniture et pose du nouvel appareillage.', prix: 70 },
        { id: 'el-luminaire', nom: 'Pose de luminaire / lustre', desc: 'Fixation, raccordement et test de fonctionnement.', prix: 80 },
        { id: 'el-electromenager', nom: 'Raccordement gros électroménager', desc: 'Tirage de ligne dédiée 32 A / 20 A et protection au tableau.', prix: 250 },
        { id: 'el-tableau', nom: 'Remplacement de tableau électrique', desc: 'Dépose, pose d’un tableau nu avec disjoncteurs différentiels.', prix: 600 },
      ] },
    ],
  },
  {
    id: 'depannage', nom: 'Dépannage général', court: 'Dépannage', img: 'depannage-fuite-seau',
    intro: 'Fuites, débouchages, vannes, pression d’eau et dépannages courants.',
    groupes: [
      { titre: 'Dépanner', items: [
        { id: 'dep-fuite-visible', nom: 'Fuite d’eau apparente', desc: 'Localisation et réparation d’une fuite visible sur tuyauterie, robinet ou raccord.', prix: 120 },
        { id: 'dep-fuite-cachee', nom: 'Fuite encastrée / non visible', desc: 'Détection d’une fuite cachée (murs, sols) à l’aide d’outils de diagnostic.', prix: 350 },
        { id: 'dep-debouchage', nom: 'Débouchage de canalisation générale', desc: 'Intervention pour rétablir l’écoulement dans les évacuations principales.', prix: 250 },
        { id: 'dep-engorgement', nom: 'Engorgement / débordement', desc: 'Débouchage d’urgence et nettoyage sur canalisation fortement engorgée.', prix: 300 },
        { id: 'dep-broyeur', nom: 'Diagnostic panne sur broyeur', desc: 'Contrôle complet, recherche de panne et contrôle de fonctionnement du broyeur.', prix: 150 },
      ] },
      { titre: 'Remplacer', items: [
        { id: 'dep-vanne', nom: 'Vanne d’arrêt générale', desc: 'Dépose de l’ancienne vanne et pose d’un robinet d’arrêt général neuf.', prix: 250 },
        { id: 'dep-pression', nom: 'Réducteur de pression', desc: 'Installation d’un réducteur pour protéger vos canalisations et appareils.', prix: 250 },
      ] },
    ],
  },
  {
    id: 'pmr', nom: 'Salle de bain PMR', court: 'PMR', img: 'pmr',
    intro: 'Adapter la salle de bain pour l’autonomie des personnes à mobilité réduite et des seniors.',
    groupes: [
      { titre: 'Adapter', items: [
        { id: 'pmr-barres', nom: 'Barres d’appui / maintien', desc: 'Fixation sécurisée de barres d’appui pour faciliter les déplacements.', prix: 250 },
        { id: 'pmr-siege', nom: 'Siège de douche mural rabattable', desc: 'Fourniture et pose d’un siège mural rabattable pour l’espace douche.', prix: 450 },
        { id: 'pmr-mitigeur', nom: 'Mitigeur thermostatique ergonomique', desc: 'Robinet thermostatique anti-brûlure avec poignées ergonomiques.', prix: 350 },
        { id: 'pmr-lavabo', nom: 'Lavabo PMR suspendu', desc: 'Dépose de l’ancien lavabo, pose d’une vasque suspendue accessible en fauteuil.', prix: 450 },
        { id: 'pmr-wc', nom: 'WC PMR', desc: 'Cuvette surélevée ou suspendue aux normes d’accessibilité.', prix: 750 },
        { id: 'pmr-douche', nom: 'Douche de plain-pied', desc: 'Dépose de la baignoire, adaptation des évacuations et création d’une douche accessible.', prix: 4500 },
      ] },
    ],
  },
];

export const PRESTATIONS = new Map();
for (const p of PIECES) for (const g of p.groupes) for (const it of g.items) PRESTATIONS.set(it.id, { ...it, piece: p.id, pieceNom: p.nom });

export function prixMin(piece) {
  let m = Infinity;
  for (const g of piece.groupes) for (const it of g.items) if (it.prix != null && it.prix < m) m = it.prix;
  return m;
}
export function nbTarifs(piece) {
  return piece.groupes.reduce((n, g) => n + g.items.filter((i) => i.prix != null).length, 0);
}
export const euros = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/ | /g, ' ') + ' €';
