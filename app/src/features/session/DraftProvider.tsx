import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { DraftContext } from './draftContext'
import { draftReducer } from './draftReducer'
import { loadDraft, saveDraft } from './draftStorage'

/**
 * Brouillon de séance partagé par toute l'application. Relu au démarrage et enregistré à chaque
 * modification : un rechargement, une erreur ou la mise en veille de la tablette ne le perdent pas.
 */
export function DraftProvider({ children }: { children: ReactNode }) {
  const [draft, dispatch] = useReducer(draftReducer, undefined, loadDraft)

  useEffect(() => {
    saveDraft(draft)
  }, [draft])

  const value = useMemo(() => ({ draft, dispatch }), [draft])
  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
}
