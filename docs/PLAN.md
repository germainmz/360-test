# Plan d'action

Plan d'exécution du projet, découpé en étapes indépendantes. Chaque étape peut être confiée telle
quelle à un agent : « Réalise l'étape N de `docs/PLAN.md` en respectant `CLAUDE.md`. »

## Mode d'emploi pour l'agent

1. Lire `CLAUDE.md`, puis l'étape demandée **en entier**, puis `API.md` si l'étape touche l'API.
2. Vérifier que les étapes listées dans « Prérequis » sont cochées **et fusionnées dans `main`**.
   Sinon, s'arrêter et le signaler.
3. Créer la branche de l'étape depuis `main` à jour (voir « Workflow Git » ci-dessous).
4. Exécuter les tâches dans l'ordre, cocher chaque case (`- [x]`) dans ce fichier, commiter au fil de l'eau.
5. Valider **tous** les critères d'acceptation et lancer les commandes de vérification.
6. Noter toute hypothèse ou écart dans `docs/DECISIONS.md`.
7. Résumer à l'humain : ce qui est fait, ce qui reste, ce qu'il doit vérifier lui-même.
   **Ne pas fusionner** : la fusion dans `main` se fait après relecture et accord de l'humain.

Ne pas déborder sur l'étape suivante. Ce qui est listé en « Hors périmètre » ne se fait pas.

## Workflow Git (obligatoire)

L'historique des commits fait partie du rendu : il est lu avant le débrief et montre comment le
travail a été découpé. **Chaque fonctionnalité est développée sur sa propre branche**, jamais
directement sur `main`.

**Règles**

- `main` est toujours stable : l'application démarre, `typecheck`, `lint`, `test` et `build` passent.
- **Une étape du plan = une branche**, créée depuis `main` à jour, nommée comme indiqué dans l'étape
  (`<type>/<sujet-court>`, en minuscules, mots séparés par des tirets).
  Types : `feat/` (fonctionnalité), `fix/` (correction), `chore/` (outillage, config), `docs/` (documentation).
- Une fonctionnalité imprévue ou une correction découverte en cours de route = **une nouvelle
  branche**, pas un ajout discret à la branche en cours. La noter dans `docs/DECISIONS.md`.
- Commits **petits et atomiques** (une intention par commit), au format
  [Conventional Commits](https://www.conventionalcommits.org/fr/) en français à l'impératif :
  `feat(catalog): ajoute le filtre par public`, `fix(session): conserve le brouillon après une erreur 500`,
  `test(session): couvre le réordonnancement au clavier`.
- Chaque commit compile. Pas de commit « wip », « fix », « divers ».
- Fusion dans `main` avec `git merge --no-ff` pour garder la trace de chaque fonctionnalité dans
  l'historique, **uniquement** après : vérifications vertes + relecture et accord de l'humain.
- Si le dépôt est poussé sur GitHub / GitLab : une Pull / Merge Request par branche, avec en
  description l'étape du plan, ce qui a été vérifié, et les captures tablette si l'étape touche l'interface.
- Après fusion : supprimer la branche locale (`git branch -d <branche>`).
- Interdits sans accord explicite de l'humain : `git push --force`, `git rebase` d'une branche déjà
  poussée, `git reset --hard`, commit direct sur `main`.

**Cycle d'une étape**

```bash
git switch main && git pull            # (pull seulement si un dépôt distant existe)
git switch -c feat/catalogue           # nom donné dans l'étape
# … travail, commits atomiques …
cd app && npm run typecheck && npm run lint && npm test && npm run build
# → l'agent s'arrête ici et demande la relecture à l'humain
git switch main
git merge --no-ff feat/catalogue -m "Merge branch 'feat/catalogue' : étape 4, trouver des vidéos"
git branch -d feat/catalogue
```

**Branches prévues**

| Étape | Branche |
|---|---|
| 0. Initialisation | `main` (seule exception : commits initiaux) |
| 1. Maquettes | `docs/maquettes` |
| 2. Socle technique | `chore/socle-technique` |
| 3. Couche API | `feat/api-client` |
| 4. Catalogue | `feat/catalogue` |
| 5. Composition | `feat/composition-seance` |
| 6. Enregistrement | `feat/enregistrement-seance` |
| 7. Mes séances | `feat/mes-seances` |
| 8. Accessibilité / responsive | `fix/accessibilite-responsive` |
| 9. README | `docs/readme` |

## Budget d'attention humaine (½ journée ≈ 4 h)

| Étape | Rôle de l'humain | Attention estimée |
|---|---|---|
| 0. Initialisation | lancer | 5 min |
| 1. Maquettes | **produire** avec Claude Design | 45 min |
| 2. Socle technique | relire la config | 10 min |
| 3. Couche API | relire les types et la gestion d'erreur | 15 min |
| 4. Catalogue | tester sur tablette, relire | 40 min |
| 5. Composition | tester clavier + tablette | 40 min |
| 6. Enregistrement | provoquer les erreurs, relire | 20 min |
| 7. Séances enregistrées (optionnel) | tester | 10 min |
| 8. Passe accessibilité / responsive | **tester soi-même** (clavier, VoiceOver) | 30 min |
| 9. README et rendu | **écrire / réécrire** | 25 min |

Si le budget est dépassé à la fin de l'étape 6 : sauter l'étape 7, faire 8 et 9, et noter ce qui
manque dans le README (« ce que j'ai laissé de côté »).

---

## Étape 0 — Initialisation du dépôt

**Objectif** : versionner le kit d'origine avant toute modification (demandé par l'énoncé).

- [ ] `git init -b main`, vérifier `.gitignore` (ajouter `dist/`, `.idea/`, `coverage/`, `.env.local`).
- [ ] Commit initial du kit tel que reçu : `chore: importe le kit d'exercice`.
- [ ] Commit de `CLAUDE.md`, `docs/PLAN.md`, `docs/DECISIONS.md` : `docs: ajoute le cadrage pour l'agent`.
- [ ] Vérifier que l'API démarre : `npm start` puis `curl 'http://localhost:4000/videos?per_page=2'`.
- [ ] (Si dépôt distant) créer le dépôt GitHub / GitLab, `git push -u origin main`.

**Critère d'acceptation** : `git log` montre le kit d'origine en premier commit ; `main` est la
seule branche ; à partir d'ici, plus aucun commit direct sur `main` (voir « Workflow Git »).

---

## Étape 1 — Maquettes (humain, avec Claude Design)

**Branche** : `docs/maquettes` (depuis `main` à jour, fusion `--no-ff` après accord de l'humain).

**Objectif** : fixer la mise en page des écrans avant le code. Étape réalisée par l'humain ;
l'agent peut seulement aider à rédiger les prompts ci-dessous.

**Livrables** dans `docs/maquettes/` :
- `01-preparer-desktop.png`, `02-preparer-tablette-portrait.png`, `03-preparer-tablette-paysage.png`
- `04-etats.png` (chargement, vide, erreur, enregistrement réussi / en échec)
- `05-seances.png` (optionnel)
- `NOTES.md` : pour chaque maquette, 3 à 5 lignes sur les choix et **pour qui** ils sont faits.

### Brief commun à donner à Claude Design

> Application web « Préparer une séance » pour Métiers 360 : catalogue de ~200 vidéos immersives 360°
> présentant des métiers (référentiel ROME). Utilisateur·ices : conseiller·es France Travail,
> enseignant·es, éducateur·ices, pressé·es, peu à l'aise avec le numérique, qui préparent souvent la
> séance quelques minutes avant, sur tablette, devant un groupe. Style sobre, lisible, contrastes
> WCAG AA, cibles tactiles ≥ 44 px, texte ≥ 16 px. Interface en français. Pas d'actions au survol.

### Écran 1 — « Préparer une séance » (écran principal, unique)

Contenu à demander :
- **Barre de recherche** large, placeholder « Rechercher un métier ou une vidéo (ex. : garagiste) ».
- **Filtres** visibles, pas cachés dans un menu : *Public* (Collégien·nes, Lycéen·nes, Jeunes en
  insertion 16-25 ans, Adultes en reconversion, Tout public), *Casque* (Pico G2 4K, Pico 4,
  Meta Quest 2, Meta Quest 3), *Métier* (liste groupée par grand domaine). Bouton « Effacer les filtres ».
- Compteur : « 42 vidéos ».
- **Grille de cartes vidéo** : vignette 16:9 (badge 360°), titre, intitulé(s) du métier, durée
  (« 7 min »), public. Bouton bien visible « Ajouter à la séance » qui devient « Ajoutée ✓ / Retirer ».
- Bouton « Afficher plus de vidéos » en bas (pas de scroll infini).
- **Panneau « Ma séance »** : champ nom, casque utilisé, liste ordonnée numérotée (miniature, titre,
  durée, boutons ↑ ↓ ✕), **durée totale**, nombre de vidéos (max 30), bouton principal « Enregistrer
  la séance ». Avertissement si une vidéo n'est pas compatible avec le casque choisi.
- Desktop : catalogue à gauche (≈ 2/3), panneau séance à droite fixe (≈ 1/3).
- Tablette portrait : panneau séance réduit en **barre fixe en bas** (« Ma séance · 4 vidéos · 23 min
  · Voir »), qui se déplie en tiroir.

### Écran 2 — États

Squelettes de cartes au chargement ; « Aucune vidéo ne correspond » avec bouton « Effacer les
filtres » ; bandeau d'erreur « Le catalogue n'a pas pu être chargé » + « Réessayer » ; panneau séance
vide (« Ajoutez des vidéos depuis le catalogue ») ; enregistrement en cours (bouton désactivé +
libellé « Enregistrement… ») ; succès (« Séance enregistrée ») ; échec (« L'enregistrement a échoué,
votre séance est conservée » + « Réessayer »).

### Écran 3 — Mes séances (optionnel)

Liste : nom, date, nombre de vidéos, durée totale. Détail : liste ordonnée des vidéos.

- [ ] Vérifications vertes, branche relue par l'humain, puis fusion dans `main` (`git merge --no-ff`) et suppression de la branche.

**Critère d'acceptation** : les PNG et `NOTES.md` sont dans `docs/maquettes/` et commités.

---

## Étape 2 — Socle technique

**Branche** : `chore/socle-technique` (depuis `main` à jour, fusion `--no-ff` après accord de l'humain).

**Prérequis** : étape 0.
**Objectif** : une application Vite vide mais complète (outils, routage, données, style, tests).

- [ ] Créer `app/` : `npm create vite@latest app -- --template react-ts`, React **18** (fixer
      `react@18` et `react-dom@18`, ainsi que les `@types` correspondants).
- [ ] `tsconfig` : `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`.
- [ ] Installer : `react-router` (v7), `@tanstack/react-query`, `tailwindcss` (+ plugin Vite),
      `react-aria-components`.
- [ ] Dev : `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`,
      `jsdom`, `vitest-axe`, ESLint (config Vite) + `eslint-plugin-jsx-a11y`, Prettier.
- [ ] Scripts `package.json` : `dev`, `build`, `preview`, `typecheck`, `lint`, `test`.
- [ ] `.env.example` avec `VITE_API_URL=http://localhost:4000` ; lecture typée dans `src/config.ts`.
- [ ] `QueryClient` global : `retry: 2` pour les lectures, `retry: 0` pour les mutations (géré à la
      main à l'étape 6), `staleTime` de 5 min pour `/jobs`, `/headsets`, `/audiences`.
- [ ] Routes : `/` (préparer une séance), `/seances` et `/seances/:id` (placeholders), page 404.
- [ ] Layout : lien d'évitement « Aller au contenu », `<header>`, `<main id="contenu">`,
      `<html lang="fr">`, titre de page mis à jour à chaque route.
- [ ] Jetons Tailwind (couleurs, focus ring) avec contrastes vérifiés AA.
- [ ] Un test de fumée : le layout s'affiche et passe `axe` sans violation.

- [ ] Vérifications vertes, branche relue par l'humain, puis fusion dans `main` (`git merge --no-ff`) et suppression de la branche.

**Critères d'acceptation** : `npm run dev` affiche le layout ; `typecheck`, `lint`, `test` et
`build` passent ; aucune dépendance hors liste `CLAUDE.md`.

**Hors périmètre** : tout écran réel.

---

## Étape 3 — Couche API

**Branche** : `feat/api-client` (depuis `main` à jour, fusion `--no-ff` après accord de l'humain).

**Prérequis** : étape 2.
**Objectif** : un accès aux données typé, robuste aux lenteurs et aux erreurs du serveur simulé.

- [ ] `src/api/types.ts` : `Video`, `Job`, `Headset`, `Audience`, `Session`, `Paginated<T>`,
      `ApiErrorBody` (`error`, `message`, `details?`), `SessionInput`. Écrits d'après `API.md`.
- [ ] `src/api/client.ts` : `apiGet<T>(path, params, signal)` et `apiPost<T>(path, body)` ;
      lève une `ApiError` (statut, code, message, `details`) ; distingue erreur réseau / 4xx / 5xx.
- [ ] Hooks dans `src/api/queries.ts` :
  - `useVideos(filters)` : `useInfiniteQuery` sur `GET /videos` (`per_page: 24`), la clé contient
    tous les filtres, `signal` transmis (annulation des requêtes périmées).
  - `useJobs()`, `useHeadsets()`, `useAudiences()` : référentiels, mis en cache longtemps.
  - `useSessions()`, `useSession(id)`.
  - `useCreateSession()` : `useMutation` sur `POST /sessions`, invalide `sessions` au succès.
- [ ] `src/lib/jobIndex.ts` : à partir de `/jobs`, fonction pure de recherche qui associe un texte
      (« garagiste », « boulang ») aux codes ROME via `label` **et** `appellations` (insensible à la
      casse et aux accents).
- [ ] Tests unitaires : `ApiError` sur 500 / 422 / réseau ; `jobIndex` (accents, appellations).

- [ ] Vérifications vertes, branche relue par l'humain, puis fusion dans `main` (`git merge --no-ff`) et suppression de la branche.

**Critères d'acceptation** : tests verts ; aucun `any` ; une réponse lente ne peut pas écraser une
réponse plus récente (vérifié par la clé de requête + test ou relecture).

**Hors périmètre** : interface.

---

## Étape 4 — Trouver des vidéos (catalogue)

**Branche** : `feat/catalogue` (depuis `main` à jour, fusion `--no-ff` après accord de l'humain).

**Prérequis** : étapes 1 et 3. Lire `docs/maquettes/01..04` et `NOTES.md`.
**Objectif** : rechercher et filtrer le catalogue, avec tous les états d'interface.

- [ ] État des filtres dans l'URL (`?q=&audience=&headset=&job=`), hook `useCatalogFilters()`.
- [ ] Recherche : champ avec libellé visible, déclenchement avec *debounce* ~300 ms, `type="search"`.
      Stratégie (hypothèse à noter) : si le texte correspond à un métier via `jobIndex`, proposer le
      métier en suggestion (« Métier : Mécanicien·ne automobile ») qui pose le filtre `job` ; sinon,
      envoyer `q` (titre).
- [ ] Filtre *Public* (boutons segmentés ou select), *Casque* (select), *Métier* (combobox React Aria
      groupée par `major_domain`). Une seule valeur par filtre (contrainte API).
- [ ] « Effacer les filtres » visible dès qu'un filtre est actif ; filtres actifs affichés en puces
      retirables.
- [ ] Compteur de résultats depuis `meta.total`, annoncé en `aria-live="polite"`.
- [ ] `VideoCard` : vignette (repli si `thumbnail_url` est `null`), titre en `h3`, intitulé(s) métier
      (jamais le code seul), durée formatée (`formatDuration` : « 7 min 35 s »), public(s).
      Bouton « Ajouter à la séance » (branché à l'étape 5 ; ici, prop `onAdd` factice).
- [ ] Pagination : bouton « Afficher plus de vidéos (24 sur 204) » ; le focus va sur la première
      nouvelle carte après chargement.
- [ ] États : squelettes au premier chargement ; résultats précédents conservés (opacité réduite)
      pendant un changement de filtre ; message « chargement plus long que d'habitude » après 2 s ;
      vide avec « Effacer les filtres » ; erreur avec « Réessayer » sans perdre les filtres.
- [ ] Tests : filtres ↔ URL, état vide, état d'erreur + réessai, `axe` sur la liste.

- [ ] Vérifications vertes, branche relue par l'humain, puis fusion dans `main` (`git merge --no-ff`) et suppression de la branche.

**Critères d'acceptation** : avec l'API simulée, rechercher « garagiste » mène aux vidéos de
mécanique ; les erreurs aléatoires affichent l'état d'erreur et « Réessayer » fonctionne ; tout est
utilisable au clavier ; lisible en 768 × 1024.

**Hors périmètre** : composition de séance, tri, filtres multi-valeurs, recherche dans les descriptions.

---

## Étape 5 — Composer la séance

**Branche** : `feat/composition-seance` (depuis `main` à jour, fusion `--no-ff` après accord de l'humain).

**Prérequis** : étape 4.
**Objectif** : sélectionner, ordonner, nommer la séance, sans jamais perdre le brouillon.

- [ ] `src/features/session/draftReducer.ts` (pur, testé) : actions `add`, `remove`, `moveUp`,
      `moveDown`, `moveTo`, `rename`, `setHeadset`, `reset`. Règles : pas de doublon, max 30 vidéos.
      Le brouillon stocke les objets `Video` utiles à l'affichage (pas seulement les ids).
- [ ] `DraftProvider` + `useDraft()` ; persistance `localStorage` (clé versionnée `m360.draft.v1`),
      relecture au démarrage, tolérante à un contenu corrompu.
- [ ] Brancher « Ajouter à la séance » des cartes : état « Ajoutée ✓ » + possibilité de retirer.
      Bouton désactivé avec explication à 30 vidéos.
- [ ] Panneau `SessionPanel` : champ nom (libellé, compteur 120 car.), select casque, liste ordonnée
      (`<ol>`) avec numéro, miniature, titre, durée, boutons « Monter », « Descendre », « Retirer »
      (libellés accessibles incluant le titre : « Monter "Une journée avec Omar…" »).
- [ ] Durée totale et nombre de vidéos toujours visibles.
- [ ] Compatibilité : si un casque est choisi, signaler chaque vidéo incompatible (icône + texte,
      pas seulement la couleur) ; proposer d'appliquer ce casque comme filtre du catalogue.
- [ ] Focus : après « Monter / Descendre », le focus reste sur le même bouton de la vidéo déplacée ;
      après « Retirer », il va sur la vidéo suivante (ou sur le titre du panneau si la liste est vide).
- [ ] Annonces `aria-live` : « Ajoutée à la séance (3 vidéos, 21 min) », « Déplacée en position 2 »,
      « Retirée ».
- [ ] Responsive : panneau latéral en desktop / tablette paysage ; barre fixe dépliable (dialog
      accessible, `Échap` pour fermer, focus piégé) en tablette portrait.
- [ ] Tests : reducer complet ; parcours clavier « ajouter 3 vidéos, déplacer la 3e en 1re, retirer
      la 2e » ; persistance après rechargement.

- [ ] Vérifications vertes, branche relue par l'humain, puis fusion dans `main` (`git merge --no-ff`) et suppression de la branche.

**Critères d'acceptation** : recharger la page conserve le brouillon ; tout le parcours se fait au
clavier seul ; en 768 × 1024 le catalogue reste utilisable avec la barre de séance visible.

**Hors périmètre** : glisser-déposer (optionnel, seulement si tout le reste est fini), plusieurs
brouillons en parallèle.

---

## Étape 6 — Enregistrer la séance

**Branche** : `feat/enregistrement-seance` (depuis `main` à jour, fusion `--no-ff` après accord de l'humain).

**Prérequis** : étape 5.
**Objectif** : envoyer la séance à l'API de façon fiable malgré 25 % d'erreurs serveur.

- [ ] Validation côté client avant envoi (mêmes règles que l'API : nom non vide après trim,
      ≤ 120 car., 1 à 30 vidéos) ; messages sous le champ, liés par `aria-describedby`,
      focus sur le premier champ en erreur.
- [ ] `POST /sessions` avec `{ name, video_ids, headset_id }` dans l'ordre du brouillon.
- [ ] Pendant l'envoi : bouton désactivé, libellé « Enregistrement… », brouillon non modifiable
      (ou modifications bloquées) pour éviter un décalage avec ce qui est envoyé.
- [ ] Erreur 5xx ou réseau : **1 nouvel essai automatique** (sans risque de doublon : l'API échoue
      avant création), puis message « L'enregistrement a échoué. Votre séance est conservée. »
      + bouton « Réessayer ». Le brouillon n'est **jamais** vidé en cas d'échec.
- [ ] Erreur 422 : afficher chaque `details[].message` sous le champ `field` correspondant.
- [ ] Succès : confirmation explicite (`role="status"`) avec nom, nombre de vidéos et durée totale,
      lien « Voir mes séances » (si étape 7) et bouton « Préparer une nouvelle séance » qui vide le
      brouillon. Le brouillon est vidé seulement à ce moment-là.
- [ ] Tests : succès, 500 puis succès au réessai, 422 mappé sur le bon champ, brouillon conservé.

- [ ] Vérifications vertes, branche relue par l'humain, puis fusion dans `main` (`git merge --no-ff`) et suppression de la branche.

**Critères d'acceptation** : en enregistrant 10 fois avec l'API simulée, chaque échec est
récupérable sans ressaisie ; aucune séance en double dans `GET /sessions`.

**Hors périmètre** : modification / suppression de séances (l'API ne le permet pas).

---

## Étape 7 — Mes séances (optionnel)

**Branche** : `feat/mes-seances` (depuis `main` à jour, fusion `--no-ff` après accord de l'humain).

**Prérequis** : étape 6. À sauter si le budget est dépassé.

- [ ] `/seances` : liste (nom, date en français, nombre de vidéos, durée totale) avec états
      chargement / vide / erreur.
- [ ] `/seances/:id` : détail avec la liste ordonnée des vidéos (récupérées via `GET /videos/{id}`
      ou depuis le cache), gestion du 404.
- [ ] Action « Repartir de cette séance » : charge la séance dans le brouillon (après confirmation
      si le brouillon courant n'est pas vide).

- [ ] Vérifications vertes, branche relue par l'humain, puis fusion dans `main` (`git merge --no-ff`) et suppression de la branche.

**Critère d'acceptation** : une séance enregistrée à l'étape 6 apparaît en tête de liste.

---

## Étape 8 — Passe accessibilité et responsive

**Branche** : `fix/accessibilite-responsive` (depuis `main` à jour, fusion `--no-ff` après accord de l'humain).

**Prérequis** : étapes 4 à 6.
**Objectif** : vérifier, pas ajouter de fonctionnalités.

Agent :
- [ ] `axe` sans violation sur chaque écran (tests) ; `eslint-plugin-jsx-a11y` sans avertissement.
- [ ] Contrastes des jetons vérifiés (texte, focus, états désactivés, avertissements).
- [ ] Ordre de tabulation logique, aucun piège au clavier, `Échap` ferme le tiroir.
- [ ] Zoom 200 % et largeur 320 px : pas de perte de contenu.
- [ ] Liste des points non corrigés dans `docs/DECISIONS.md`.
- [ ] Un commit par correction (`fix(a11y): …`), pour que chaque correction soit lisible dans l'historique.
- [ ] Après les vérifications humaines ci-dessous : fusion dans `main` (`git merge --no-ff`) et
      suppression de la branche.

Humain (à faire soi-même, l'agent ne peut pas le remplacer) :
- [ ] Parcours complet au clavier seul.
- [ ] Parcours avec VoiceOver (macOS ou iPad) : annonces d'ajout, de déplacement, d'enregistrement.
- [ ] Test sur une vraie tablette ou l'émulation Chrome 768 × 1024 et 1024 × 768, au doigt.

---

## Étape 9 — README et rendu

**Branche** : `docs/readme` (depuis `main` à jour, fusion `--no-ff` après accord de l'humain).

**Prérequis** : toutes les étapes réalisées ou volontairement abandonnées.

- [ ] Remplacer `README.md` (l'agent propose un brouillon, **l'humain réécrit** : c'est ce qui est lu
      avant le débrief, il doit être lisible en 5 minutes). Sections exigées par l'énoncé :
  - lancer le projet (commandes seules) ;
  - les **3** hypothèses qui ont le plus pesé (depuis `docs/DECISIONS.md`) ;
  - les **2 ou 3** principaux choix d'interface et pour qui (capture de la maquette bienvenue) ;
  - ce qui a été laissé de côté et pourquoi ;
  - ce que je ferais avec une journée de plus ;
  - usage de l'IA : délégué / vérifié soi-même / **une** décision prise contre l'outil ;
  - temps d'attention consacré et nombre de sessions.
- [ ] Joindre `CLAUDE.md`, `docs/PLAN.md`, `docs/DECISIONS.md` (facultatif, mais utile au débrief).
- [ ] Fusion dans `main` (`git merge --no-ff`), puis vérifier que `git branch` ne liste plus que
      `main` et que `git log --graph --oneline` montre une fusion par étape.
- [ ] Vérifier une installation propre : cloner dans un dossier vide, suivre le README à la lettre.
- [ ] Pousser sur GitHub / GitLab avec l'historique complet (branches fusionnées incluses).

---

## Préparation du débrief (après rendu)

Le débrief fait évoluer le besoin en direct. Points d'extension à garder simples dans le code :
filtres (ajouter un filtre = une entrée de config), règles du brouillon (centralisées dans le
reducer), client API (un seul endroit pour les en-têtes, l'URL de base, les erreurs).
Exemples d'évolutions probables à anticiper mentalement : filtre par durée, filtres multi-valeurs,
modifier une séance enregistrée, envoyer la séance sur les casques, mode hors ligne.
