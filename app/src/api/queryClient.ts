import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './ApiError'
import { queryKeys } from './queryKeys'

const REFERENCE_STALE_TIME = 5 * 60 * 1000
const MAX_READ_RETRIES = 2

/** Référentiels quasi statiques : mis en cache longtemps pour ne pas les recharger à chaque écran. */
export const REFERENCE_QUERY_KEYS = [queryKeys.jobs, queryKeys.headsets, queryKeys.audiences]

export function shouldRetryRead(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && !error.isRetryable) return false
  return failureCount < MAX_READ_RETRIES
}

export function createQueryClient(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetryRead, refetchOnWindowFocus: false },
      // Le réessai des enregistrements est géré à la main (étape 6).
      mutations: { retry: 0 },
    },
  })
  for (const queryKey of REFERENCE_QUERY_KEYS) {
    queryClient.setQueryDefaults(queryKey, { staleTime: REFERENCE_STALE_TIME })
  }
  return queryClient
}
