import { afterEach, describe, expect, it, vi } from 'vitest'
import { jsonResponse, mockFetch } from '../test/fetchMock'
import { ApiError } from './ApiError'
import { apiGet, apiPost, buildUrl } from './client'

// Tests du client HTTP sans vrai serveur : `fetch` est remplacé par une fausse réponse
// pour reproduire chaque cas que l'API simulée peut renvoyer (succès, 500, 422, coupure…).

// Configuration remplaçable test par test, pour simuler une URL d'API différente.
const mockConfig = vi.hoisted(() => ({ apiUrl: 'http://localhost:4000' }))
vi.mock('../config', () => ({ config: mockConfig }))

// Remet le vrai `fetch` et l'URL par défaut entre deux tests.
afterEach(() => {
  vi.unstubAllGlobals()
  mockConfig.apiUrl = 'http://localhost:4000'
})

// Récupère l'erreur levée pour pouvoir inspecter ses propriétés (type, statut, détails).
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

  // Cas du déploiement Docker : le front appelle « /api », relayé par nginx.
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

  // L'API simulée renvoie ce type d'erreur au hasard (8 % des lectures, 25 % des enregistrements).
  it('lève une ApiError « server » réessayable sur une 500', async () => {
    mockFetch(() =>
      jsonResponse({ error: 'internal_error', message: 'An unexpected error occurred.' }, 500),
    )
    const error = await catchError(apiGet('/videos'))
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ kind: 'server', status: 500, code: 'internal_error' })
    expect(error instanceof ApiError && error.isRetryable).toBe(true)
  })

  // Ces messages seront affichés sous le champ concerné du formulaire de séance (étape 6).
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

  // Ex. : un proxy qui répond en texte brut au lieu du JSON de l'API.
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

  // Une recherche remplacée par une plus récente est annulée : ce n'est pas une panne à afficher.
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
