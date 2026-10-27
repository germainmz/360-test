import { createContext, useContext } from 'react'
import type { Draft } from './draftReducer'
import type { FieldErrors } from './validateDraft'

/** Contenu d'une séance à recopier dans le brouillon (« Repartir de cette séance »). */
export type DraftContent = Pick<Draft, 'name' | 'headsetId' | 'videos'>

export interface SaveSessionContextValue {
  isSaving: boolean
  /** Échec serveur ou réseau, après le nouvel essai automatique : la séance reste dans le brouillon. */
  hasFailed: boolean
  /** Erreurs à afficher sous chaque champ ; un champ modifié depuis l'envoi n'affiche plus la sienne. */
  errors: FieldErrors
  /** Change à chaque refus : le panneau place alors le focus sur le premier champ en erreur. */
  errorFocusRequest: number
  save: () => void
  /**
   * Remplace le brouillon : vide (« Préparer une nouvelle séance ») ou copie d'une séance
   * enregistrée. Ce sont les seuls moments où le brouillon courant est abandonné.
   */
  startNew: (from?: DraftContent) => void
}

export const SaveSessionContext = createContext<SaveSessionContextValue | null>(null)

export function useSaveSession(): SaveSessionContextValue {
  const value = useContext(SaveSessionContext)
  if (!value) throw new Error('useSaveSession doit être utilisé sous <SaveSessionProvider>')
  return value
}
