import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { jsonResponse, mockFetch } from '../test/fetchMock'
import { useVideos } from './queries'
import type { VideoFilters } from './queryKeys'
import type { Paginated, Video } from './types'

// Tests des hooks de données, avec un faux `fetch` dont on contrôle le moment de chaque réponse.

afterEach(() => {
  vi.unstubAllGlobals()
})

// Fabrique une page de résultats d'une seule vidéo, reconnaissable à son titre.
function page(title: string, meta: Partial<Paginated<Video>['meta']> = {}): Paginated<Video> {
  return {
    data: [
      {
        id: `vid_${title}`,
        title,
        description: '',
        duration_seconds: 60,
        jobs: [],
        audiences: [],
        compatible_headsets: [],
        thumbnail_url: null,
        published_at: '2024-01-01',
      },
    ],
    meta: { page: 1, per_page: 24, total: 1, total_pages: 1, ...meta },
  }
}

// Cache neuf à chaque test, sans réessai, pour que les tests restent indépendants et rapides.
function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useVideos', () => {
  // Cas réel : l'API peut mettre 4,5 s à répondre. On tape « garage » puis « boulanger » ;
  // la réponse à « garage » arrive en dernier et ne doit pas remplacer les bons résultats.
  it('ignore une réponse lente arrivée après celle de la recherche suivante', async () => {
    // Chaque requête reste en attente jusqu'à ce que le test décide d'y répondre.
    const pending = new Map<string, { resolve: (r: Response) => void; signal: AbortSignal }>()
    mockFetch(
      (url, init) =>
        new Promise<Response>((resolve) => {
          const signal = init.signal ?? new AbortController().signal
          pending.set(url.searchParams.get('q') ?? '', { resolve, signal })
        }),
    )

    const { result, rerender } = renderHook((filters: VideoFilters) => useVideos(filters), {
      wrapper,
      initialProps: { q: 'garage' },
    })
    await waitFor(() => expect(pending.has('garage')).toBe(true))

    rerender({ q: 'boulanger' })
    await waitFor(() => expect(pending.has('boulanger')).toBe(true))

    // La recherche la plus récente répond en premier…
    act(() => pending.get('boulanger')?.resolve(jsonResponse(page('boulanger'))))
    await waitFor(() => expect(result.current.data?.pages[0]?.data[0]?.title).toBe('boulanger'))

    // …puis l'ancienne, en retard : elle est ignorée et sa requête a été annulée.
    act(() => pending.get('garage')?.resolve(jsonResponse(page('garage'))))
    await new Promise((r) => setTimeout(r, 20))
    expect(result.current.data?.pages[0]?.data[0]?.title).toBe('boulanger')
    expect(pending.get('garage')?.signal.aborted).toBe(true)
  })

  // Les espaces autour du texte sont retirés et les filtres vides ne sont pas envoyés.
  it('transmet tous les filtres et la pagination', async () => {
    const fetchMock = mockFetch(() => jsonResponse(page('a', { total: 30, total_pages: 2 })))
    const { result } = renderHook(
      () => useVideos({ q: '  garage ', job: 'I1604', headset: '', audience: 'lycee' }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const url = new URL(String(fetchMock.mock.calls[0]?.[0]))
    expect(Object.fromEntries(url.searchParams)).toEqual({
      q: 'garage',
      job: 'I1604',
      audience: 'lycee',
      page: '1',
      per_page: '24',
    })
    expect(result.current.hasNextPage).toBe(true)
  })
})
