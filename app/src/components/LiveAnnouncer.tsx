import { useCallback, useRef, useState, type ReactNode } from 'react'
import { AnnouncerContext } from './announcerContext'

/**
 * Région `aria-live="polite"` unique de l'application. Elle est présente dès le départ (une région
 * ajoutée au moment du message n'est pas lue) ; on la vide puis on la remplit pour qu'un même
 * message répété (« Retirée ») soit annoncé à nouveau.
 */
export function LiveAnnouncer({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const announce = useCallback((next: string) => {
    setMessage('')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(next), 50)
  }, [])

  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="sr-only" data-testid="annonces">
        {message}
      </div>
    </AnnouncerContext.Provider>
  )
}
