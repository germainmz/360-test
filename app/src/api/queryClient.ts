import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './ApiError'
import { queryKeys } from './queryKeys'

const REFERENCE_STALE_TIME = 5 * 60 * 1000
const MAX_READ_RETRIES = 2
/** L'API échoue avant de créer la séance : un nouvel essai ne peut pas créer de doublon. */
const MAX_SAVE_RETRIES = 1

/** Référentiels quasi statiques : mis en cache longtemps pour ne pas les recharger à chaque écran. */
export const REFERENCE_QUERY_KEYS = [queryKeys.jobs, queryKeys.headsets, queryKeys.audiences]

function shouldRetry(failureCount: number, error: Error, maxRetries: number): boolean {
  if (error instanceof ApiError && !error.isRetryable) return false
  return failureCount < maxRetries
}

export function shouldRetryRead(failureCount: number, error: Error): boolean {
  return shouldRetry(failureCount, error, MAX_READ_RETRIES)
}

/** Enregistrement d'une séance : un seul nouvel essai automatique, puis la main à l'utilisateur·ice. */
export function shouldRetrySave(failureCount: number, error: Error): boolean {
  return shouldRetry(failureCount, error, MAX_SAVE_RETRIES)
}

export function createQueryClient(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetryRead, refetchOnWindowFocus: false },
      // Pas de réessai par défaut pour un envoi : chaque mutation décide (voir useCreateSession).
      mutations: { retry: 0 },
    },
  })
  for (const queryKey of REFERENCE_QUERY_KEYS) {
    queryClient.setQueryDefaults(queryKey, { staleTime: REFERENCE_STALE_TIME })
  }
  return queryClient
}
