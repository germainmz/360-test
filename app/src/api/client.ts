import { config } from '../config'
import { ApiError, parseErrorBody } from './ApiError'

export type QueryParams = Record<string, string | number | null | undefined>

export function buildUrl(path: string, params: QueryParams = {}): string {
  // `apiUrl` peut être absolue (http://localhost:4000) ou relative (/api, derrière un proxy).
  const url = new URL(config.apiUrl + path, window.location.origin)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '')
      url.searchParams.set(key, String(value))
  }
  return url.toString()
}

async function request<T>(url: string, init: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, {
      ...init,
      headers: { Accept: 'application/json', ...init.headers },
    })
  } catch (error) {
    // Une annulation (requête périmée) n'est pas une erreur à afficher : TanStack Query l'ignore.
    if (init.signal?.aborted) throw error
    throw new ApiError('network', null, {
      error: 'network_error',
      message: 'Le serveur ne répond pas.',
    })
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null)
    const kind = response.status >= 500 ? 'server' : 'client'
    throw new ApiError(kind, response.status, parseErrorBody(body, response.status))
  }

  // Le corps n'est pas validé à l'exécution : on se fie au contrat décrit dans API.md.
  const data: T = await response.json()
  return data
}

export function apiGet<T>(path: string, params?: QueryParams, signal?: AbortSignal): Promise<T> {
  return request<T>(buildUrl(path, params), { method: 'GET', signal })
}

export function apiPost<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return request<T>(buildUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
}
