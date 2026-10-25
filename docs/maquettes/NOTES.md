# Maquettes — notes de conception

Source : projet Claude Design « Préparation de séance Métiers 360 »
(https://claude.ai/design/p/7bacec41-ec9c-4c49-8074-9f5874e8a255). Captures en résolution ×2,
importées le 2026-10-26. En cas de conflit avec `CLAUDE.md`, les règles d'accessibilité priment
(écarts listés en bas et dans `docs/DECISIONS.md`).

## 00 — Fondations visuelles (`00-fondations-visuelles.png`)

- Palette retenue : **1a « Bleu institutionnel, terre cuite »** (c'est celle des écrans). La 1b
  « Vert sapin, ocre » est écartée.
- Jetons : bleu action `#1F4E8C`, terre cuite `#A8481F` (numéros d'ordre), vert confirmation
  `#2E6B3E`, encre `#1E2733` / secondaire `#55606E`, fond papier `#FAF7F2`, bordure `#8A8378`.
  Tous ≥ 4,5:1 en texte, bordures ≥ 3:1.
- Police **Atkinson Hyperlegible Next** (400 / 600 / 700), aucun texte sous 16 px : pensée pour
  les lecteur·ices malvoyant·es et la lecture à distance sur tablette.
- Focus clavier : double anneau sombre bien visible, indépendant de la couleur de l'élément.

## 01 — Préparer une séance, desktop 1440 × 900 (`01-preparer-desktop.png`)

- Catalogue à gauche (≈ 2/3), panneau « Ma séance » fixe à droite : chercher, ajouter et
  enregistrer sans changer d'écran, pour les personnes pressées.
- Recherche large avec exemples concrets (« garagiste, coiffure, logistique ») ; trois filtres
  toujours visibles (Public, Casque, Métier), filtres actifs en puces retirables + « Effacer les filtres ».
- Carte ajoutée : bordure bleue, « ✓ Dans la séance · n° 1 » et bouton « Retirer » — l'état se lit
  par le texte, pas seulement la couleur.
- Panneau : nom (compteur 27 / 120), casque facultatif, résumé « 4 vidéos · 33 min », liste numérotée
  avec ↑ ↓ ✕ de 44 px minimum, alerte « Non compatible avec … » sous la vidéo concernée.

## 02 — Tablette portrait 768 × 1024 (`02-…portrait.png`, `02b-…tiroir.png`)

- Le catalogue prend toute la largeur (2 colonnes) ; la séance devient une **barre fixe en bas**
  « Ma séance · 4 vidéos · 33 min » + « Voir et enregistrer » : le résumé reste visible au doigt.
- Le tiroir ouvert occupe ~60 % de l'écran par-dessus un voile ; bouton « Fermer ✕ » textuel en haut,
  bouton « Enregistrer la séance » pleine largeur en bas, à portée de pouce.
- Titres complets dans le tiroir (plus de place qu'en desktop) pour éviter les troncatures.

## 03 — Tablette paysage 1024 × 768 (`03-preparer-tablette-paysage.png`)

- Même disposition que le desktop (catalogue + panneau), car c'est l'usage le plus fréquent devant
  un groupe (tablette posée).
- Filtres sur deux lignes (Public + Casque, puis Métier pleine largeur), grille de 2 cartes.
- Dans le panneau, les boutons ↑ ↓ ✕ passent sous le titre pour garder des cibles de 44 px ; le pied
  « 4 vidéos · 33 min » + « Enregistrer » reste collé en bas.

## 04 — États (`04-etats.png`)

- Catalogue : squelettes (filtres déjà utilisables) ; chargement lent avec message rassurant ;
  « Aucune vidéo ne correspond à votre recherche » + « Effacer les filtres » ; erreur en
  `role="alert"` avec « Réessayer » qui garde recherche et filtres.
- Panneau : vide (« Ajoutez des vidéos depuis le catalogue »), nom manquant (bordure + icône +
  message, pas seulement le rouge), « Enregistrement… » désactivé, échec « Votre séance est
  conservée » + « Réessayer », succès avec « Voir mes séances » / « Préparer une nouvelle séance ».
- Limite de 30 vidéos : « Ajouter » désactivé avec l'explication écrite sous le bouton ; « Retirer »
  reste actif.

## 05 — Mes séances (`05-seances.png`, optionnel)

- Desktop : liste à gauche (la plus récente en haut), détail à droite ; tablette portrait : liste
  seule, « Voir » ouvre le détail.
- Chaque ligne : nom, date en toutes lettres, nombre de vidéos, durée — ce qu'il faut pour retrouver
  une séance devant le groupe.
- « Repartir de cette séance » copie la séance dans le brouillon (l'API ne permet pas de modifier).
- États chargement / aucune séance (avec lien vers « Préparer une séance ») / erreur + « Réessayer ».

## Écarts à corriger à l'implémentation

- **Chargement lent** : la maquette affiche le message après ~5 s ; `CLAUDE.md` impose > 2 s → on
  suit `CLAUDE.md`.
- **↑ du premier / ↓ du dernier** grisés : à rendre avec `aria-disabled` (et non `disabled`) pour
  que le focus ne soit pas perdu après un déplacement en première / dernière position.
- **Données factices incohérentes** (desktop) : casque du panneau non choisi mais alerte « Non
  compatible avec Pico G2 4K » ; l'alerte n'apparaîtra que si un casque est choisi.
- Le casque du panneau et le filtre « Casque » du catalogue sont distincts ; le lien entre les deux
  (« appliquer ce casque comme filtre ») est prévu à l'étape 5, pas dessiné.
