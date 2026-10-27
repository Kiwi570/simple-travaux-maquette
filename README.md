# Simple Travaux — maquette « Le Réseau »

Maquette de démonstration du futur site de **Simple Travaux**, l'activité de Pedro, artisan plombier, chauffagiste et électricien à Longueil-Sainte-Marie (60126).

Le site est statique : HTML, CSS et JavaScript, sans étape de construction. Il est prêt pour Vercel.

## Pages

| Adresse | Contenu |
| --- | --- |
| `/` | Accueil : maison en coupe, urgence, galerie des pièces, étapes, prix, Pedro, zone de 30 km, salle de bain PMR, appel |
| `/estimation` | Estimateur : 10 pièces, 100 tarifs TTC repris du site actuel, total en direct, demande d'intervention simulée |
| `/contact` | Numéro, rendez-vous simulé, zone d'intervention, formulaire de message simulé |
| `/mentions-legales` | Mentions légales et confidentialité, avec les informations manquantes marquées « à compléter » |
| `/404` | Page d'erreur aux couleurs du site |

## Direction artistique

- **Ambiance :** un plan de plomberie vivant, sur papier calque.
- **Polices :** Archivo (version élargie), Instrument Sans, JetBrains Mono. Elles sont hébergées avec le site, en WOFF2.
- **Couleurs :**
  - papier `#F2EEE4` ;
  - bleu de plan `#12324F` ;
  - cuivre `#C46A2B` ;
  - eau froide `#2F7BEA` ;
  - eau chaude `#E0483A`.
- **Effet signature :** une canalisation de cuivre longe toute la page. Elle se branche dans chaque section par un raccord et une vanne, et l'eau y circule au rythme du défilement.
- **Effets propres au métier :**
  - la maison en coupe du héros, avec ses réseaux et ses prix ;
  - le compteur d'eau à rouleaux pour les prix ;
  - les vannes quart de tour des étapes ;
  - les cotes de plan autour des images ;
  - le compas qui balaie les 30 km ;
  - les gouttes qui tombent du raccord ;
  - l'ondulation d'eau en WebGL sur les images ;
  - la transition de page « vidange ».
- **Bouton « Mode calme » :** toujours visible. Il coupe les animations, mémorise le choix et revient à la section en cours. Il est activé d'office si le système demande de réduire les animations.

## Bibliothèques (dans `assets/vendor`)

- **GSAP 3.15** : ScrollTrigger, SplitText, DrawSVGPlugin. Licence « Standard no charge » de GreenSock.
- **Lenis 1.3.27** : licence MIT.
- **OGL 1.0.11** : licence Unlicense.
- **Polices :** licence SIL Open Font License.

## Version 2 : corrections issues de l'audit

- **Maison en coupe :**
  - les étiquettes de prix ne recouvrent plus les repères numérotés ;
  - au survol, chaque poste affiche trois tarifs réels.
- **Galerie des pièces :** chaque carte donne un exemple de tarif réel et le nombre de tarifs.
- **Lisibilité :**
  - aucun texte sous 12 px ;
  - le vert de « Compris » est assez contrasté ;
  - les noms de la carte de zone ne se chevauchent plus ;
  - la consigne s'adapte au tactile (« Touchez une commune »).
- **Calendrier :** les jours passés sont visiblement indisponibles, le jour même est repéré, et chaque case n'affiche que la date.
- **Téléphone :**
  - le total de l'estimateur reste visible pendant qu'on coche ;
  - les espaces entre sections sont resserrés ;
  - le portrait vient après le texte ;
  - les zones tactiles font au moins 44 px.
- **Mise en page :**
  - sur ordinateur, les colonnes courtes accompagnent la lecture (prix, demande, rendez-vous, message, mentions) ;
  - les cotes de plan sont tracées sans pointillés parasites.
- **Pages :**
  - un appel final a été ajouté en fin d'estimateur ;
  - les mentions légales ont une fiche récapitulative, avec le nombre d'informations à compléter ;
  - l'emplacement du portrait de Pedro a été redessiné.
- **Réseau :** une tête de pose (manchon et goutte) marque le bout de la canalisation en cours de pose.
- **Fluidité :** les animations décoratives en boucle se mettent en pause pendant le défilement et hors écran.

## Mettre à jour la maquette

- **Données :** les pages sont générées à partir des données (`assets/js/data/tarifs.js`, `assets/js/data/site.js`) par `node tools/build.mjs`.
- **Version :** à chaque version livrée, le numéro `?v=N` change partout, de façon identique (`tools/version.txt`, pages HTML, `import` JavaScript).
- **Cache :** `vercel.json` ne contient volontairement aucune règle `Cache-Control`.

## À retirer à la mise en ligne définitive

1. `<meta name="robots" content="noindex, nofollow">` dans chaque page (`tools/build.mjs`, fonction `head`).
2. L'en-tête `X-Robots-Tag` dans `vercel.json`.
3. Les mentions « Maquette » du pied de page et des formulaires.
4. La simulation des formulaires : à brancher sur un vrai envoi, avec une politique de confidentialité complète.
5. L'adresse `og:url` / `og:image`, à faire pointer vers le domaine définitif.

## Informations à compléter avec Pedro

- **Identité :**
  - nom et prénom de l'exploitant ;
  - statut ;
  - numéro d'immatriculation (RNE / SIRET) ;
  - TVA ;
  - directeur de la publication.
- **Assurance et qualifications :** assurance décennale (assureur, zone de couverture) et qualifications réelles.
- **Prix :**
  - taux horaire et frais de déplacement affichés TTC (l'arrêté du 24 janvier 2017 demande un taux horaire TTC) ;
  - préciser si le déplacement est inclus dans les tarifs.
- **Photos :** portrait de Pedro et vraies photos de chantiers. Les visuels actuels sont générés.
- **Données personnelles :** durée de conservation et base légale des formulaires.

## Incohérences relevées sur le site actuel

- **Mauvais numéro :** 07.01.18.33.22 au lieu de 07 61 18 33 22, sur les pages PMR, baignoire, chauffe-eau, cuisine, douche et WC.
- **Texte de modèle oublié :** « [Ton numéro de téléphone] » sur la page chauffage.
- **Zone :** le site parle de 30 km, mais aussi de 20 km (page WC). Il cite Beauvais et Méru, à environ 50 km.
- **Horaires :** « Urgence 7j/7 » sur l'accueil, mais du lundi au samedi de 8h à 19h sur la page contact.
- **Nom :** « Simple Travaux » et « Budget Travaux / Simple Travaux ».
- **Qualifications :** « Artisans qualifiés, professionnels certifiés » au pluriel, sans qualification citée, alors que Pedro intervient seul.
- **Prix « à partir de » contraires aux grilles :**
  - groupe de sécurité : 120 € contre 220 € ;
  - ballon de 150 L : 550 € contre 1 150 € ;
  - bac de douche : 350 € contre 650 € ;
  - mitigeur de cuisine : 90 € contre 250 €.
- **Prix de l'électricité :** le formulaire ne donne pas les mêmes montants que le tableau.
- **Calculateur en ligne :** les montants semblent mal saisis (« 18,000.00 » pour 180 €, « 4.50 » pour 4 500 €).
- **HT et TTC mélangés :** page WC, tableau « Total HT » à côté de tarifs TTC.
- **Coquilles :** titre « contacte », « Réalisé votre devis .Marquez un rendez-vous ».
- **Mentions légales incomplètes :** voir la liste ci-dessus.

## Sources des images

- **Site actuel** (dans `assets/img`) : plombier, électricien, chauffagiste, cuisine, WC, lavabo, baignoire, douche, chauffe-eau, dépannage, salle de bain PMR, et les rendus d'équipements de la page contact.
- **Grok** : hero-reseau, piece-radiateur, piece-electricite, pmr, atelier, mains-raccord, fuite-macro, camionnette, chantier-propre, riviere, papier-calque, 404-fuite.
- **Code** : maison en coupe, carte de la zone, compteur, cadre provisoire du portrait.

Aucune image ne présente une personne comme étant Pedro.
