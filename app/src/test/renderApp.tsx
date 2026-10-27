import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { createQueryClient } from '../api/queryClient'
import { routes } from '../routes'

/** Cache de production, mais sans réessai automatique : un test d'erreur échoue tout de suite. */
export function createTestQueryClient(): QueryClient {
  const queryClient = createQueryClient()
  const defaults = queryClient.getDefaultOptions()
  queryClient.setDefaultOptions({ ...defaults, queries: { ...defaults.queries, retry: false } })
  return queryClient
}

/**
 * Affiche l'application complète (mêmes routes et même cache qu'en production) à l'adresse
 * donnée. Le routeur « en mémoire » remplace la barre d'adresse du navigateur.
 */
export function renderApp(path = '/', queryClient: QueryClient = createQueryClient()) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { ...view, router }
}
