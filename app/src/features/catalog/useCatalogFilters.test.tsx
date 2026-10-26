import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { useCatalogFilters } from './useCatalogFilters'

// Le hook lit et écrit les filtres dans l'URL ; on le monte dans un routeur en mémoire
// et on observe l'adresse courante en même temps que l'état renvoyé.
function renderFilters(initialUrl: string) {
  let router: ReturnType<typeof createMemoryRouter> | undefined
  const wrapper = ({ children }: { children: ReactNode }) => {
    router ??= createMemoryRouter([{ path: '/', element: children }], {
      initialEntries: [initialUrl],
    })
    return <RouterProvider router={router} />
  }
  const hook = renderHook(() => ({ ...useCatalogFilters(), search: useLocation().search }), {
    wrapper,
  })
  return hook
}

describe('useCatalogFilters', () => {
  it('lit les filtres depuis l’URL et ignore les valeurs vides', () => {
    const { result } = renderFilters('/?q=garage&audience=lycee&headset=&job=I1604')
    expect(result.current.filters).toEqual({ q: 'garage', audience: 'lycee', job: 'I1604' })
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('écrit un filtre dans l’URL et retire ceux qu’on vide', () => {
    const { result } = renderFilters('/?q=garage')
    act(() => result.current.update({ headset: 'pico-4', q: '' }))
    expect(result.current.search).toBe('?headset=pico-4')
    expect(result.current.filters).toEqual({ headset: 'pico-4' })
  })

  it('« Effacer les filtres » remet tout à zéro, recherche comprise', () => {
    const { result } = renderFilters('/?q=garage&audience=lycee&job=I1604')
    act(() => result.current.clearAll())
    expect(result.current.search).toBe('')
    expect(result.current.hasActiveFilters).toBe(false)
  })
})
