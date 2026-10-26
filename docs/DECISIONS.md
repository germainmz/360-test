# Décisions, hypothèses et usage de l'IA

Journal tenu au fil du projet (par l'humain et par l'agent). Sert de matière première au README final.
Une entrée = une ligne ou deux, datée. Ne pas réécrire l'historique : ajouter une entrée qui annule.

## Hypothèses (là où la spécification est muette)

Format : `AAAA-MM-JJ — Hypothèse — Pourquoi — Question posée par mail ? (oui/non, réponse)`

- 2026-10-25 — Un seul écran pour chercher et composer (pas d'assistant en étapes) — utilisateur·ices
  pressé·es, souvent sur tablette devant le groupe — non.
- 2026-10-25 — Une même vidéo ne peut pas figurer deux fois dans une séance — l'API l'accepte mais
  cela ressemble à une erreur de manipulation — non.
- 2026-10-25 — La recherche par métier passe par les appellations ROME côté client (« garagiste »),
  car `q` ne cherche que dans le titre — non.
- 2026-10-25 — Le casque est facultatif ; s'il est choisi, les vidéos incompatibles sont signalées
  mais pas bloquées — l'API ne vérifie pas la compatibilité — non.
- 2026-10-26 — Recherche de métier : chaque mot saisi doit être le début d'un mot du libellé ou d'une
  appellation, avec une tolérance de famille de mots (racine commune ≥ 5 lettres : « coiffure » →
  Coiffeur, « logistique » → Cariste). Les libellés passent avant les appellations. Quelques
  rapprochements larges (« cuisine » → livreur de plats cuisinés) acceptés : ils restent des
  suggestions — non.
- 2026-10-27 — Recherche : le texte part en `q` (titres) 300 ms après la frappe ; si le texte
  ressemble à un métier, des suggestions « Métier : … » apparaissent dans la liste du champ **et**
  sous forme de gros boutons « Voir les vidéos : … » au-dessus des résultats. Les choisir pose le
  filtre Métier et vide le texte. Pas de bascule automatique vers le métier : elle surprendrait.
- 2026-10-27 — Filtre Métier en liste déroulante native groupée par grand domaine (`<optgroup>`)
  plutôt qu'en combobox React Aria comme prévu au plan : la maquette dessine une liste déroulante,
  le sélecteur natif est le plus confortable au doigt sur tablette, et la saisie libre d'un métier
  est déjà couverte par le champ de recherche — non.
- 2026-10-27 — L'URL est mise à jour en `replace` (pas une entrée d'historique par filtre) : le
  bouton Retour quitte la page au lieu de défaire les filtres un par un — non.
- 2026-10-27 — Un métier absent du référentiel n'est pas affiché sur la carte (jamais le code ROME
  seul) ; une puce de filtre inconnu affiche « Métier : sélectionné » — non.
- 2026-10-26 — Les lectures en erreur 5xx ou réseau sont réessayées 2 fois, jamais les 4xx (une 404
  ne changera pas) — non.

## Choix techniques

- 2026-10-25 — TanStack Query : cache, annulation des requêtes périmées et réessais, indispensables
  avec une API lente (jusqu'à 4,5 s) et 8 % d'erreurs en lecture.
- 2026-10-25 — Tailwind + React Aria Components plutôt qu'Ant Design : composants accessibles
  (combobox, dialog) sans lutter contre un thème ; Tailwind est utilisé par l'équipe.
- 2026-10-25 — Réordonner par boutons « Monter / Descendre » plutôt que glisser-déposer : utilisable
  au clavier, au lecteur d'écran et au doigt sans précision.
- 2026-10-26 — Le gabarit Vite actuel fournit oxlint : remplacé par **ESLint 9** comme prévu, pour
  `eslint-plugin-jsx-a11y` (règles `strict`). ESLint 10 écarté : jsx-a11y ne le supporte pas encore.
- 2026-10-26 — Versions du gabarit conservées : Vite 8, TypeScript 6, Vitest 5, Tailwind 4 ; React
  fixé en 18.3 comme demandé.
- 2026-10-26 — Police Atkinson Hyperlegible Next chargée depuis Google Fonts (pas de dépendance npm) ;
  repli `system-ui` si le réseau la bloque.
- 2026-10-26 — `vitest-axe` 0.1 déclare ses matchers pour l'ancien Vitest : les tests vérifient
  `results.violations` égal à `[]` au lieu d'étendre `expect`. La règle `color-contrast` d'axe ne
  tourne pas sous jsdom : les contrastes sont vérifiés par un test sur les jetons de `index.css`.
- 2026-10-26 — `npm run typecheck` = `tsc -b` (références de projet du gabarit), équivalent à
  `tsc --noEmit` cité dans `CLAUDE.md`.
- 2026-10-26 — Les réponses de l'API ne sont pas validées à l'exécution (pas de Zod, hors liste) :
  les types de `api/types.ts` suivent `API.md` ; seuls les corps d'erreur sont vérifiés, car ils
  pilotent l'affichage des messages.
- 2026-10-26 — `refetchOnWindowFocus` désactivé : éviter que le catalogue se recharge et bouge quand
  on revient sur l'onglet ou réveille la tablette devant le groupe.
- 2026-10-26 — **Déploiement Docker** (demandé par l'humain, hors plan, branche `chore/docker`) :
  `docker compose up --build` lance l'API (Dockerfile du kit, inchangé) et le front (build Vite servi
  par l'image `nginx:1.27-alpine`, ajoutée pour l'occasion). nginx relaie `/api/` et `/thumbnails/`
  vers l'API : même origine, pas de CORS, et le front est construit avec `VITE_API_URL=/api`.
  `Host` est transmis avec le port pour que l'API génère des URL de vignettes valides.

- 2026-10-27 — Hooks React génériques (`useDebouncedValue`, `useDelayedFlag`) dans `src/hooks/`,
  dossier absent de l'arborescence cible : `src/lib/` est réservé aux fonctions pures.
- 2026-10-27 — Workflow Git adapté à la demande de l'humain : chaque branche est poussée sur GitHub
  avec une Pull Request, et la branche distante est **conservée** après fusion (historique visible).
  Seule la branche locale est supprimée.

## Choix d'interface (et pour qui)

- 2026-10-26 — Palette « bleu institutionnel, terre cuite » et police Atkinson Hyperlegible Next
  (maquette 00) : sobre, très lisible pour un public peu à l'aise ou malvoyant, contrastes AA vérifiés.
- 2026-10-26 — Tablette paysage = disposition desktop (catalogue + panneau) ; seule la tablette
  portrait passe le panneau en barre fixe + tiroir (maquettes 02 et 03).

- 2026-10-27 — Cartes : chaque bouton « Ajouter à la séance » porte le titre de la vidéo en texte
  masqué (« Ajouter à la séance : Sophie, coiffeuse à Lyon ») pour que les lecteurs d'écran
  distinguent les boutons ; les puces de filtre sont entièrement cliquables (cible plus grande
  que la seule croix de la maquette).

## Écarts maquettes / CLAUDE.md

- 2026-10-26 — Message de chargement lent : ~5 s sur la maquette 04, **> 2 s** retenu (`CLAUDE.md`).
- 2026-10-26 — Boutons ↑ / ↓ inactifs en bout de liste : `aria-disabled` plutôt que `disabled`
  pour ne pas perdre le focus après un déplacement (règle focus de `CLAUDE.md`).
- 2026-10-27 — Badge « 360° » : les vignettes servies par l'API le contiennent déjà ; le badge de
  la maquette n'est ajouté que sur le visuel de remplacement (vidéos sans vignette).

## Laissé de côté volontairement

-

## Accessibilité : points connus non corrigés

-

## Usage de l'IA

- Délégué :
- Vérifié moi-même :
- Décision prise contre une proposition de l'outil :

## Temps d'attention

| Date | Durée | Contenu |
|---|---|---|
| 2026-10-25 | | Cadrage : CLAUDE.md, plan, décisions |
