import { createContext, useContext } from 'react'

export type Announce = (message: string) => void

export const AnnouncerContext = createContext<Announce | null>(null)

/** Fait lire un message par les lecteurs d'écran (« Ajoutée à la séance… »), sans l'afficher. */
export function useAnnounce(): Announce {
  const announce = useContext(AnnouncerContext)
  if (!announce) throw new Error('useAnnounce doit être utilisé sous <LiveAnnouncer>')
  return announce
}
