import type { RouteObject } from 'react-router'
import { Layout } from './components/Layout'
import { NotFoundPage } from './components/NotFoundPage'
import { PreparePage } from './features/catalog/PreparePage'
import { SessionDetailPage } from './features/sessions/SessionDetailPage'
import { SessionsPage } from './features/sessions/SessionsPage'

// Toutes les pages partagent le même Layout (en-tête + navigation). Liste partagée par
// l'application (main.tsx) et les tests (renderApp.tsx) pour qu'ils testent les vraies routes.
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <PreparePage /> },
      // Liste toujours là (sauf en tablette portrait) ; le détail s'affiche à côté.
      {
        path: 'seances',
        element: <SessionsPage />,
        children: [{ path: ':id', element: <SessionDetailPage /> }],
      },
      // Toute autre adresse : page 404.
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
