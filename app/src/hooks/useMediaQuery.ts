import { useEffect, useState } from 'react'

/**
 * Suit une media query CSS. `fallback` sert quand `matchMedia` n'existe pas (tests sous jsdom).
 */
export function useMediaQuery(query: string, fallback: boolean): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : fallback,
  )

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const list = window.matchMedia(query)
    const update = () => setMatches(list.matches)
    update()
    list.addEventListener('change', update)
    return () => list.removeEventListener('change', update)
  }, [query])

  return matches
}
