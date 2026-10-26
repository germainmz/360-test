import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { createQueryClient } from './api/queryClient'
import './index.css'
import { routes } from './routes'

const queryClient = createQueryClient()
const router = createBrowserRouter(routes)

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Élément #root introuvable dans index.html')

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
