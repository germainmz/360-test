import { vi } from 'vitest'

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** Remplace `fetch` global ; le gestionnaire reçoit l'URL et les options de chaque appel. */
export function mockFetch(handler: (url: URL, init: RequestInit) => Promise<Response> | Response) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init: RequestInit = {}) =>
    Promise.resolve(handler(new URL(String(input)), init)),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
