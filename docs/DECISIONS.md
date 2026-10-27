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
- 2026-10-27 — Après « Retirer » dans le panneau, le focus va sur la vidéo suivante, à défaut la
  précédente, à défaut le titre « Ma séance » — non.
- 2026-10-27 — Casque choisi dans le panneau : chaque vidéo incompatible est signalée (icône +
  texte), un résumé compte les vidéos concernées et propose « Afficher seulement les vidéos
  compatibles », qui pose le filtre Casque du catalogue. Rien n'est bloqué — non.
- 2026-10-27 — Enregistrement : le nom est envoyé sans les espaces autour, mais le brouillon garde
  la saisie telle quelle. Une séance refusée (422) n'est pas réessayée et n'affiche pas
  « Réessayer » : seul le champ concerné l'est. Un refus sans champ reconnu est traité comme un
  échec (message + « Réessayer ») — non.
- 2026-10-27 — Une fois enregistrée, la séance reste affichée en confirmation et le brouillon est
  **figé** (reducer + boutons inactifs avec explication) jusqu'à « Préparer une nouvelle séance » :
  une modification après coup ne serait pas enregistrée, et ce verrou persiste au rechargement,
  ce qui évite de réenregistrer la même séance en double — non.
- 2026-10-27 — Un message d'erreur sous un champ disparaît dès que ce champ est modifié ; il n'est
  pas recalculé à la frappe (on ne signale pas « nom obligatoire » pendant qu'on l'efface) — non.
- 2026-10-27 — « Repartir de cette séance » garde le même nom (modifiable avant d'enregistrer) et
  le même casque. La confirmation n'est demandée que si le brouillon courant n'est pas enregistré
  et contient un nom ou une vidéo ; « Garder ma séance en cours » a le focus par défaut — non.
- 2026-10-27 — Une vidéo d'une séance qui n'est plus au catalogue (404) est signalée dans le détail
  et n'est pas copiée ; le bouton « Repartir » le dit avant le clic. Si une vidéo n'a pas pu être
  chargée (erreur passagère), « Repartir » attend qu'elle le soit (« Réessayer » sur la ligne) — non.

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
- 2026-10-27 — Brouillon et région d'annonces (`aria-live`) fournis par le `Layout` : ils
  survivent aux changements de page (utile pour « Repartir de cette séance », étape 7).
- 2026-10-27 — Un seul panneau « Ma séance » est monté à la fois (latéral ≥ 1024 px, tiroir en
  dessous), choisi par `matchMedia` : deux panneaux cachés par CSS dupliqueraient les champs, leurs
  identifiants et les annonces.
- 2026-10-27 — Délais des tests relevés (15 s par test, 3 s pour `findBy…`) : sous charge, jsdom
  rend lentement les écrans complets ; aucune attente fixe n'a été ajoutée dans les tests.
- 2026-10-27 — Enregistrement géré par un `SaveSessionProvider` placé dans le `Layout`, à côté du
  brouillon : fermer le tiroir pendant l'envoi ne perd ni la réponse ni le message d'échec.
  Réessai automatique unique (`shouldRetrySave`, délai d'1 s de TanStack Query) réservé aux
  erreurs 5xx et réseau.
- 2026-10-27 — « Mes séances » en route imbriquée : `/seances` garde la liste et affiche le détail
  `/seances/:id` à côté (≥ 1024 px) ; en dessous, le détail s'affiche seul avec « ← Toutes mes
  séances » (maquette 05). Les vidéos d'une séance sont lues une par une (`GET /videos/{id}`,
  l'API n'a pas de recherche par liste) et reprises du cache du catalogue quand elles y sont.
- 2026-10-27 — Focus après une navigation par lien (`useFocusOnNavigation`) : sur le titre de la
  page, ou sur le nom de la séance ouverte. Rien au chargement initial ni avec Précédent/Suivant.

## Choix d'interface (et pour qui)

- 2026-10-26 — Palette « bleu institutionnel, terre cuite » et police Atkinson Hyperlegible Next
  (maquette 00) : sobre, très lisible pour un public peu à l'aise ou malvoyant, contrastes AA vérifiés.
- 2026-10-26 — Tablette paysage = disposition desktop (catalogue + panneau) ; seule la tablette
  portrait passe le panneau en barre fixe + tiroir (maquettes 02 et 03).
- 2026-10-27 — Cartes : chaque bouton « Ajouter à la séance » porte le titre de la vidéo en texte
  masqué (« Ajouter à la séance : Sophie, coiffeuse à Lyon ») pour que les lecteurs d'écran
  distinguent les boutons ; les puces de filtre sont entièrement cliquables (cible plus grande
  que la seule croix de la maquette).
- 2026-10-27 — Annule l'entrée précédente sur le texte masqué : le titre est passé dans un
  `aria-label` (« Ajouter à la séance : … », « Retirer de la séance : … »), car le texte masqué
  n'est pas lu de la même façon partout (espaces perdus). Le nom commence toujours par le texte
  visible, pour la commande vocale.
- 2026-10-27 — Une carte ajoutée montre « ✓ Dans la séance · n° 2 » et un bouton « Retirer » ; c'est
  le même bouton qui change de libellé, pour que le focus reste en place.

## Écarts maquettes / CLAUDE.md

- 2026-10-26 — Message de chargement lent : ~5 s sur la maquette 04, **> 2 s** retenu (`CLAUDE.md`).
- 2026-10-26 — Boutons ↑ / ↓ inactifs en bout de liste : `aria-disabled` plutôt que `disabled`
  pour ne pas perdre le focus après un déplacement (règle focus de `CLAUDE.md`).
- 2026-10-27 — Badge « 360° » : les vignettes servies par l'API le contiennent déjà ; le badge de
  la maquette n'est ajouté que sur le visuel de remplacement (vidéos sans vignette).
- 2026-10-27 — Barre tablette portrait : bouton « Voir ma séance » tant que l'enregistrement
  n'existe pas (maquette : « Voir et enregistrer », à reprendre à l'étape 6). Résumé « 4 vidéos ·
  33 min » placé en pied de panneau sur tous les écrans (la maquette desktop le met en haut).
- 2026-10-27 — Étape 6 : le bouton de la barre devient « Voir et enregistrer » comme sur la
  maquette (« Voir la confirmation » une fois la séance enregistrée). Pendant l'envoi, le bouton
  reste focalisable (`aria-disabled`) et passe par « Enregistrement… » puis « Réessayer » si
  besoin : le focus ne saute pas.
- 2026-10-27 — Liste des séances : toute la carte est cliquable (lien étiré) ; « Voir » / « Affichée »
  sont décoratifs, la séance affichée est signalée par `aria-current="page"`. Titre « Mes séances »
  au-dessus des deux colonnes (la maquette le met dans la colonne de gauche) pour qu'il reste en
  tablette portrait quand le détail est affiché seul.

## Laissé de côté volontairement

- 2026-10-27 — Rechargement de la page **pendant** un envoi : si le serveur a créé la séance,
  le brouillon ne le sait pas et un nouvel « Enregistrer » créerait un doublon. Cas rare (envoi
  de 0,2 à 4,5 s) ; l'API n'offre pas de clé d'idempotence pour l'éviter.

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

## Corrections découvertes en cours de route

- 2026-10-27 — `fix/saisie-recherche` : sous charge, des lettres tapées dans la recherche étaient
  perdues (« garagiste » → « gaagiste ») : l'URL, mise à jour 300 ms après la frappe, réécrasait
  le champ si la personne continuait à taper. Le champ ignore désormais l'écho de sa propre
  écriture. Trouvé par un test instable pendant l'étape 5 ; test de régression ajouté.
