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
- 2026-10-26 — `refetchOnWindowFocus` désactivé : éviter que le catalogue se recharge et bouge quand
  on revient sur l'onglet ou réveille la tablette devant le groupe.

## Choix d'interface (et pour qui)

- 2026-10-26 — Palette « bleu institutionnel, terre cuite » et police Atkinson Hyperlegible Next
  (maquette 00) : sobre, très lisible pour un public peu à l'aise ou malvoyant, contrastes AA vérifiés.
- 2026-10-26 — Tablette paysage = disposition desktop (catalogue + panneau) ; seule la tablette
  portrait passe le panneau en barre fixe + tiroir (maquettes 02 et 03).

## Écarts maquettes / CLAUDE.md

- 2026-10-26 — Message de chargement lent : ~5 s sur la maquette 04, **> 2 s** retenu (`CLAUDE.md`).
- 2026-10-26 — Boutons ↑ / ↓ inactifs en bout de liste : `aria-disabled` plutôt que `disabled`
  pour ne pas perdre le focus après un déplacement (règle focus de `CLAUDE.md`).

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
