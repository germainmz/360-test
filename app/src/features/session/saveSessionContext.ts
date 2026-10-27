import { createContext, useContext } from 'react'
import type { FieldErrors } from './validateDraft'

export interface SaveSessionContextValue {
  isSaving: boolean
  /** Échec serveur ou réseau, après le nouvel essai automatique : la séance reste dans le brouillon. */
  hasFailed: boolean
  /** Erreurs à afficher sous chaque champ ; un champ modifié depuis l'envoi n'affiche plus la sienne. */
  errors: FieldErrors
  /** Change à chaque refus : le panneau place alors le focus sur le premier champ en erreur. */
  errorFocusRequest: number
  save: () => void
  /** « Préparer une nouvelle séance » : seul moment où le brouillon est vidé. */
  startNew: () => void
}

export const SaveSessionContext = createContext<SaveSessionContextValue | null>(null)

export function useSaveSession(): SaveSessionContextValue {
  const value = useContext(SaveSessionContext)
  if (!value) throw new Error('useSaveSession doit être utilisé sous <SaveSessionProvider>')
  return value
}
