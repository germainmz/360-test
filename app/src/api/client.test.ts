import { afterEach, describe, expect, it, vi } from 'vitest'
import { jsonResponse, mockFetch } from '../test/fetchMock'
import { ApiError } from './ApiError'
import { apiGet, apiPost, buildUrl } from './client'

const mockConfig = vi.hoisted(() => ({ apiUrl: 'http://localhost:4000' }))
vi.mock('../config', () => ({ config: mockConfig }))

afterEach(() => {
  vi.unstubAllGlobals()
  mockConfig.apiUrl = 'http://localhost:4000'
})

async function catchError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise
  } catch (error) {
    return error
  }
  throw new Error('La promesse aurait dû échouer')
}

describe('buildUrl', () => {
  it('ignore les paramètres vides', () => {
    expect(buildUrl('/videos', { q: 'garage', job: '', headset: undefined, page: 2 })).toBe(
      'http://localhost:4000/videos?q=garage&page=2',
    )
  })

  it('accepte une URL d’API relative (derrière un proxy)', () => {
    mockConfig.apiUrl = '/api'
    expect(buildUrl('/jobs')).toBe(`${window.location.origin}/api/jobs`)
  })
})

describe('apiGet / apiPost', () => {
  it('renvoie le corps JSON en cas de succès', async () => {
    mockFetch(() => jsonResponse({ data: [{ id: 'pico-4', name: 'Pico 4' }] }))
    await expect(apiGet('/headsets')).resolves.toEqual({ data: [{ id: 'pico-4', name: 'Pico 4' }] })
  })

  it('envoie le corps JSON d’un POST', async () => {
    const fetchMock = mockFetch(() => jsonResponse({ id: 'ses_004' }, 201))
    await apiPost('/sessions', { name: 'Atelier', video_ids: ['vid_001'] })
    const [, init] = fetchMock.mock.calls[0] ?? []
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe('{"name":"Atelier","video_ids":["vid_001"]}')
  })

  it('lève une ApiError « server » réessayable sur une 500', async () => {
    mockFetch(() =>
      jsonResponse({ error: 'internal_error', message: 'An unexpected error occurred.' }, 500),
    )
    const error = await catchError(apiGet('/videos'))
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ kind: 'server', status: 500, code: 'internal_error' })
    expect(error instanceof ApiError && error.isRetryable).toBe(true)
  })

  it('lève une ApiError « client » avec les détails par champ sur une 422', async () => {
    mockFetch(() =>
      jsonResponse(
        {
          error: 'validation_error',
          message: 'Invalid session.',
          details: [
            { field: 'name', message: 'Le nom est obligatoire.' },
            { field: 'video_ids', message: 'Au moins une vidéo est requise.' },
          ],
        },
        422,
      ),
    )
    const error = await catchError(apiPost('/sessions', { name: '', video_ids: [] }))
    expect(error).toBeInstanceOf(ApiError)
    if (!(error instanceof ApiError)) return
    expect(error).toMatchObject({ kind: 'client', status: 422, code: 'validation_error' })
    expect(error.isRetryable).toBe(false)
    expect(error.fieldErrors()).toEqual({
      name: 'Le nom est obligatoire.',
      video_ids: 'Au moins une vidéo est requise.',
    })
  })

  it('tolère un corps d’erreur absent ou inattendu', async () => {
    mockFetch(() => new Response('Bad gateway', { status: 502 }))
    const error = await catchError(apiGet('/videos'))
    expect(error).toMatchObject({ kind: 'server', status: 502, code: 'http_error', details: [] })
  })

  it('lève une ApiError « network » quand le serveur ne répond pas', async () => {
    mockFetch(() => Promise.reject(new TypeError('Failed to fetch')))
    const error = await catchError(apiGet('/videos'))
    expect(error).toMatchObject({ kind: 'network', status: null, code: 'network_error' })
  })

  it('laisse passer une annulation sans la transformer en erreur réseau', async () => {
    const controller = new AbortController()
    mockFetch(() => {
      controller.abort()
      return Promise.reject(new DOMException('Aborted', 'AbortError'))
    })
    const error = await catchError(apiGet('/videos', {}, controller.signal))
    expect(error).not.toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ name: 'AbortError' })
  })
})
