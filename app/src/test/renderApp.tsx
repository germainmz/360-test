import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { createQueryClient } from '../api/queryClient'
import { routes } from '../routes'

/**
 * Affiche l'application complète (mêmes routes et même cache qu'en production) à l'adresse
 * donnée. Le routeur « en mémoire » remplace la barre d'adresse du navigateur.
 */
export function renderApp(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}
