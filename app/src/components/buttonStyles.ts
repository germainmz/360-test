/**
 * Styles de boutons communs, d'après la maquette 00. Toutes les variantes font au moins 44 px
 * de haut (cible tactile) ; le focus visible est donné globalement dans index.css.
 */
const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg text-lg font-semibold disabled:cursor-not-allowed aria-disabled:cursor-not-allowed'

export const buttonStyles = {
  primary: `${base} bg-action px-5 text-surface hover:bg-action-hover`,
  secondary: `${base} border-2 border-action bg-surface px-5 text-action hover:bg-action-subtle`,
  /** Bouton qui ressemble à un lien (« Effacer les filtres ») mais garde une grande zone cliquable. */
  link: `${base} px-1 text-action underline underline-offset-4 hover:text-action-hover`,
} as const
