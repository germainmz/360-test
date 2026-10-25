# CLAUDE.md

Contexte et règles pour tout agent IA qui travaille sur ce dépôt. À lire en entier avant toute tâche.
Le plan d'exécution est dans `docs/PLAN.md` ; les décisions et hypothèses dans `docs/DECISIONS.md`.

## Le produit en une phrase

Une petite application web pour **préparer une séance** de vidéos 360° (métiers ROME) : trouver des
vidéos, les sélectionner, les ordonner, nommer la séance, l'enregistrer via l'API.

## Pour qui (à garder en tête à chaque choix d'interface)

- Conseiller·es France Travail, enseignant·es, éducateur·ices.
- **Pressé·es**, **pas toujours à l'aise avec le numérique**.
- Préparent parfois la séance **quelques minutes avant, sur une tablette, devant le groupe**.

Conséquences non négociables :
- cibles tactiles ≥ 44 × 44 px, pas d'action accessible uniquement au survol ;
- le parcours principal (chercher → ajouter → nommer → enregistrer) tient sur **un seul écran** ;
- libellés en français simple, pas de jargon technique ni de codes ROME seuls (toujours l'intitulé) ;
- aucune perte du brouillon de séance (rechargement, erreur réseau, mise en veille de la tablette).

## Stack

- React 18, TypeScript **strict**, Vite. Node ≥ 20.
- Routage : React Router 7 (mode librairie / data router, SPA).
- Données serveur : TanStack Query (cache, retry, annulation, `placeholderData` pour éviter le clignotement).
- Brouillon de séance : `useReducer` + Context, persisté dans `localStorage`.
- Style : Tailwind CSS. Composants accessibles : React Aria Components (combobox, select, dialog).
- Tests : Vitest + Testing Library + `vitest-axe`.

Ne pas ajouter de dépendance hors de cette liste sans le noter dans `docs/DECISIONS.md` avec la raison.

## Commandes

```bash
npm start                    # API simulée sur http://localhost:4000 (racine du dépôt)
cd app && npm install
cd app && npm run dev        # front sur http://localhost:5173
cd app && npm run typecheck  # tsc --noEmit
cd app && npm run lint
cd app && npm test           # vitest run
```

Avant de déclarer une tâche terminée : `typecheck`, `lint` et `test` passent.

## Arborescence cible

```
server/               API simulée fournie — NE PAS MODIFIER
API.md                doc de l'API — source de vérité des contrats
app/                  application front (Vite)
  src/api/            client HTTP, types des réponses, hooks TanStack Query
  src/features/catalog/   recherche, filtres, liste de vidéos
  src/features/session/   brouillon de séance (reducer, panneau, enregistrement)
  src/features/sessions/  liste et détail des séances enregistrées
  src/components/     composants UI génériques (Button, EmptyState, ErrorState…)
  src/lib/            utilitaires purs (formatDuration, etc.)
docs/                 PLAN.md, DECISIONS.md, maquettes/
```

## Faits sur l'API à ne pas oublier (vérifiés dans `server/server.mjs`)

- Base : `http://localhost:4000`, configurable via `VITE_API_URL`.
- **Latence** : 150–900 ms, et 10 % des requêtes entre 2 et 4,5 s → les requêtes de recherche peuvent
  revenir dans le désordre : toujours annuler / ignorer les réponses périmées (TanStack Query le fait
  si la clé de requête contient tous les paramètres).
- **Erreurs 500 aléatoires** : 8 % des lectures, **25 % des `POST /sessions`**. `/headsets` et
  `/audiences` n'échouent jamais. L'erreur 500 est levée **avant** la création : réessayer un POST
  en échec est sans risque de doublon.
- `GET /videos` : `q` cherche **uniquement dans le titre** ; `job`, `headset`, `audience` acceptent
  **une seule valeur** chacun ; pagination `page` / `per_page` (max 100), `meta.total` disponible.
- `GET /jobs` : 55 métiers, non paginé, avec `major_domain` et `appellations` (utiles pour une
  recherche « garagiste » → code ROME côté client).
- `thumbnail_url` peut être `null` (3 vidéos) → prévoir un visuel de remplacement.
- `POST /sessions` : `name` obligatoire (trim, ≤ 120 car.), `video_ids` 1 à 30, `headset_id` optionnel.
  Le serveur **ne vérifie pas** la compatibilité vidéo/casque ni les doublons : c'est au front.
- `422` renvoie `details: [{ field, message }]` → afficher chaque message sous le champ concerné.
- Pas de modification ni suppression de séance. Séances perdues au redémarrage du serveur.

## Règles de code

- TypeScript strict, pas de `any`, pas de `as` pour masquer une erreur. Types des réponses API dans
  `src/api/types.ts`, écrits à la main d'après `API.md`.
- Composants fonctionnels, un composant par fichier, nommage `PascalCase.tsx`, hooks `useXxx.ts`.
- Logique métier pure (reducer, formatage, validation) séparée des composants et testée unitairement.
- État des filtres et de la recherche **dans l'URL** (partageable, survit au rechargement).
- Pas de `console.log` laissé dans le code. Pas de commentaires qui paraphrasent le code.
- Textes d'interface en français, écriture inclusive au point médian comme l'API (`Collégien·nes`).

## Accessibilité (WCAG 2.2 AA / RGAA) — vérifier à chaque composant

- HTML sémantique d'abord (`button`, `nav`, `main`, `h1`…`h3`, `ul`), ARIA seulement si nécessaire.
- Tout est utilisable **au clavier**, focus **toujours visible** (anneau ≥ 2 px, contraste ≥ 3:1).
- Contraste texte ≥ 4,5:1 (≥ 3:1 pour le gros texte et les composants).
- Réordonner sans glisser-déposer : boutons « Monter » / « Descendre » (le drag reste optionnel).
- Annonces lecteur d'écran via une région `aria-live="polite"` : nombre de résultats, vidéo ajoutée /
  retirée / déplacée, séance enregistrée. Erreurs bloquantes en `role="alert"`.
- Après une action qui retire un élément, le focus va sur un élément logique (suivant, ou titre).
- Chaque vignette a un `alt` vide (décorative) : le titre est déjà lu juste à côté.
- Respecter `prefers-reduced-motion`.

## États d'interface obligatoires (chaque écran qui charge des données)

Chargement (squelettes, pas de spinner plein écran) · vide (message + action pour s'en sortir, ex.
« Effacer les filtres ») · erreur (message humain + bouton « Réessayer », sans perdre la saisie) ·
chargement lent (> 2 s : message rassurant) · succès d'enregistrement (confirmation explicite).

## Responsive

Cibles de test : **tablette 768 × 1024 et 1024 × 768** (prioritaire), desktop 1440 × 900.
Desktop : catalogue + panneau séance côte à côte. Tablette portrait : panneau séance en barre
fixe en bas, dépliable.

## Maquettes

Les maquettes sont produites avec Claude Design et déposées dans `docs/maquettes/` (PNG + notes).
Si une maquette existe pour l'écran en cours, elle fait foi pour la mise en page ; les règles
d'accessibilité de ce fichier priment en cas de conflit (le signaler dans `docs/DECISIONS.md`).

## Façon de travailler pour l'agent

- Suivre `docs/PLAN.md` étape par étape ; cocher les cases au fur et à mesure.
- **Git : une fonctionnalité = une branche.** Jamais de commit direct sur `main`. Créer la branche
  de l'étape depuis `main` à jour (nom donné dans `docs/PLAN.md`, format `feat/…`, `fix/…`,
  `chore/…`, `docs/…`). Commits atomiques en Conventional Commits, en français à l'impératif
  (`feat(catalog): ajoute le filtre par public`). Chaque commit compile.
- Ne **jamais fusionner** une branche sans accord explicite de l'humain ; la fusion se fait en
  `git merge --no-ff` pour garder la trace de chaque fonctionnalité. Pas de `push --force`,
  `reset --hard` ni rebase de branche poussée sans accord. Détails : « Workflow Git » de `docs/PLAN.md`.
- Spécification muette ? Ne pas inventer en silence : choisir l'option la plus simple pour
  l'utilisateur cible, puis l'ajouter dans `docs/DECISIONS.md` (section Hypothèses).
- S'arrêter et demander à l'humain si : une étape dépasse son périmètre, une dépendance nouvelle
  semble nécessaire, ou une règle de ce fichier doit être enfreinte.
- Ne jamais modifier `server/`, `API.md`, ni réécrire le `README.md` avant l'étape finale.
