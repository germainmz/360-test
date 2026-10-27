import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query'
import { apiGet, apiPost } from './client'
import { shouldRetrySave } from './queryClient'
import { normalizeFilters, queryKeys, type VideoFilters } from './queryKeys'
import type {
  Audience,
  Headset,
  JobsResponse,
  ListResponse,
  Paginated,
  Session,
  SessionInput,
  Video,
} from './types'

export const VIDEOS_PER_PAGE = 24

/**
 * La clé contient tous les filtres : une réponse lente d'une ancienne recherche ne peut pas
 * remplacer celle de la recherche courante, et la requête périmée est annulée via `signal`.
 */
export function useVideos(filters: VideoFilters) {
  const normalized = normalizeFilters(filters)
  return useInfiniteQuery({
    queryKey: queryKeys.videos(normalized),
    queryFn: ({ pageParam, signal }) =>
      apiGet<Paginated<Video>>(
        '/videos',
        { ...normalized, page: pageParam, per_page: VIDEOS_PER_PAGE },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: ({ meta }) => (meta.page < meta.total_pages ? meta.page + 1 : undefined),
    // Garde les résultats précédents affichés pendant un changement de filtre (pas de clignotement).
    placeholderData: keepPreviousData,
  })
}

/** Une vidéo ne change pas pendant l'utilisation : inutile de la recharger à chaque écran. */
const VIDEO_STALE_TIME = 5 * 60 * 1000

/** Vidéo déjà reçue dans une page du catalogue : affichée sans nouvelle requête. */
function findCatalogVideo(queryClient: QueryClient, id: string): Video | undefined {
  const cached = queryClient.getQueriesData<InfiniteData<Paginated<Video>>>({
    queryKey: ['videos'],
  })
  for (const [, data] of cached) {
    for (const page of data?.pages ?? []) {
      const video = page.data.find((item) => item.id === id)
      if (video) return video
    }
  }
  return undefined
}

/**
 * Les vidéos d'une séance, dans l'ordre, une requête `GET /videos/{id}` par vidéo (l'API n'a pas
 * de recherche par liste d'ids). Une vidéo déjà vue dans le catalogue vient du cache.
 */
export function useVideosByIds(ids: string[]) {
  const queryClient = useQueryClient()
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: queryKeys.video(id),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        apiGet<Video>(`/videos/${encodeURIComponent(id)}`, {}, signal),
      initialData: () => findCatalogVideo(queryClient, id),
      staleTime: VIDEO_STALE_TIME,
    })),
  })
}

// Référentiels (métiers, casques, publics) : `select` renvoie directement la liste,
// sans l'enveloppe `{ data }` de l'API.

export function useJobs() {
  return useQuery({
    queryKey: queryKeys.jobs,
    queryFn: ({ signal }) => apiGet<JobsResponse>('/jobs', {}, signal),
    select: (response) => response.data,
  })
}

export function useHeadsets() {
  return useQuery({
    queryKey: queryKeys.headsets,
    queryFn: ({ signal }) => apiGet<ListResponse<Headset>>('/headsets', {}, signal),
    select: (response) => response.data,
  })
}

export function useAudiences() {
  return useQuery({
    queryKey: queryKeys.audiences,
    queryFn: ({ signal }) => apiGet<ListResponse<Audience>>('/audiences', {}, signal),
    select: (response) => response.data,
  })
}

/** Séances enregistrées, la plus récente en premier (ordre donné par l'API). */
export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions,
    queryFn: ({ signal }) => apiGet<ListResponse<Session>>('/sessions', {}, signal),
    select: (response) => response.data,
  })
}

export function useSession(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.session(id ?? ''),
    queryFn: ({ signal }) =>
      apiGet<Session>(`/sessions/${encodeURIComponent(id ?? '')}`, {}, signal),
    enabled: Boolean(id),
  })
}

/**
 * Enregistre une séance. Une erreur serveur ou réseau est réessayée une fois automatiquement
 * (sans risque de doublon, voir `shouldRetrySave`) ; une séance refusée (422) ne l'est pas.
 */
export function useCreateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SessionInput) => apiPost<Session>('/sessions', input),
    retry: shouldRetrySave,
    // La nouvelle séance est mise en cache tout de suite (détail affichable sans attendre)
    // et la liste « Mes séances » sera rechargée pour l'inclure.
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.session(session.id), session)
      return queryClient.invalidateQueries({ queryKey: queryKeys.sessions, exact: true })
    },
  })
}
