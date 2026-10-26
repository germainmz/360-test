import { describe, expect, it } from 'vitest'
import { ApiError } from './ApiError'
import { shouldRetryRead } from './queryClient'

// Règle de réessai automatique des lectures : utile pour les pannes passagères de l'API,
// inutile pour une erreur de la requête (une page introuvable le restera).

const serverError = new ApiError('server', 500, { error: 'internal_error' })
const notFound = new ApiError('client', 404, { error: 'not_found' })
const networkError = new ApiError('network', null, { error: 'network_error' })

describe('shouldRetryRead', () => {
  // Le premier argument est le nombre d'échecs déjà subis : au 3e échec, on abandonne.
  it('réessaie deux fois une erreur serveur ou réseau', () => {
    expect(shouldRetryRead(0, serverError)).toBe(true)
    expect(shouldRetryRead(1, networkError)).toBe(true)
    expect(shouldRetryRead(2, serverError)).toBe(false)
  })

  it('ne réessaie pas une erreur 4xx', () => {
    expect(shouldRetryRead(0, notFound)).toBe(false)
  })
})
