import { useEffect, useState } from 'react'

/**
 * Passe à `true` quand `active` est resté vrai pendant `delay` ms : sert à n'afficher le message
 * « chargement plus long que d'habitude » que si l'attente dure vraiment.
 */
export function useDelayedFlag(active: boolean, delay: number): boolean {
  const [elapsed, setElapsed] = useState(false)
  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setElapsed(true), delay)
    return () => {
      clearTimeout(timer)
      setElapsed(false)
    }
  }, [active, delay])
  return active && elapsed
}
