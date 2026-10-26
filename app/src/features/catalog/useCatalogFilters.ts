import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { VideoFilters } from '../../api/queryKeys'

/** Filtres à valeur unique (contrainte de l'API) ; ajouter un filtre = ajouter une entrée ici. */
export const FILTER_NAMES = ['audience', 'headset', 'job'] as const
export type FilterName = (typeof FILTER_NAMES)[number]

const PARAM_NAMES = ['q', ...FILTER_NAMES] as const
type ParamName = (typeof PARAM_NAMES)[number]

/**
 * État de la recherche et des filtres, stocké dans l'URL (?q=&audience=&headset=&job=) :
 * l'adresse est partageable et survit au rechargement de la page.
 */
export function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo<VideoFilters>(() => {
    const result: VideoFilters = {}
    for (const name of PARAM_NAMES) {
      const value = searchParams.get(name)?.trim()
      if (value) result[name] = value
    }
    return result
  }, [searchParams])

  // `replace` : taper une recherche ne doit pas empiler une entrée d'historique par mot.
  const update = useCallback(
    (changes: Partial<Record<ParamName, string | undefined>>) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          for (const [name, value] of Object.entries(changes)) {
            const trimmed = value?.trim()
            if (trimmed) next.set(name, trimmed)
            else next.delete(name)
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const clearAll = useCallback(() => {
    update(Object.fromEntries(PARAM_NAMES.map((name) => [name, undefined])))
  }, [update])

  const hasActiveFilters = PARAM_NAMES.some((name) => filters[name])

  return { filters, update, clearAll, hasActiveFilters }
}
