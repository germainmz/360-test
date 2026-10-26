import type { RouteObject } from 'react-router'
import { Layout } from './components/Layout'
import { NotFoundPage } from './components/NotFoundPage'
import { PreparePage } from './features/catalog/PreparePage'
import { SessionDetailPage } from './features/sessions/SessionDetailPage'
import { SessionsPage } from './features/sessions/SessionsPage'

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <PreparePage /> },
      { path: 'seances', element: <SessionsPage /> },
      { path: 'seances/:id', element: <SessionDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
