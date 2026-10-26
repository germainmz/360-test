import { QueryClient } from '@tanstack/react-query'

const REFERENCE_STALE_TIME = 5 * 60 * 1000

/** Référentiels quasi statiques : mis en cache longtemps pour ne pas les recharger à chaque écran. */
export const REFERENCE_QUERY_KEYS = [['jobs'], ['headsets'], ['audiences']] as const

export function createQueryClient(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: 2, refetchOnWindowFocus: false },
      // Le réessai des enregistrements est géré à la main (étape 6).
      mutations: { retry: 0 },
    },
  })
  for (const queryKey of REFERENCE_QUERY_KEYS) {
    queryClient.setQueryDefaults(queryKey, { staleTime: REFERENCE_STALE_TIME })
  }
  return queryClient
}
