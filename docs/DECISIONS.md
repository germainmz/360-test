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

## Choix d'interface (et pour qui)

-

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
