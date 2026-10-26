/** Filtres du catalogue ; l'API n'accepte qu'une seule valeur par filtre. */
export interface VideoFilters {
  /** Texte cherché dans le titre. */
  q?: string
  /** Code ROME. */
  job?: string
  headset?: string
  audience?: string
}

/** Retire les filtres vides pour qu'une même recherche donne toujours la même clé de cache. */
export function normalizeFilters(filters: VideoFilters): VideoFilters {
  const normalized: VideoFilters = {}
  const q = filters.q?.trim()
  if (q) normalized.q = q
  if (filters.job) normalized.job = filters.job
  if (filters.headset) normalized.headset = filters.headset
  if (filters.audience) normalized.audience = filters.audience
  return normalized
}

/**
 * Clés du cache des données serveur, définies à un seul endroit. Deux requêtes avec la même clé
 * partagent le même résultat ; changer un filtre change la clé, donc relance une requête.
 * `session` commence par « sessions » : rafraîchir la liste peut aussi viser chaque détail.
 */
export const queryKeys = {
  videos: (filters: VideoFilters) => ['videos', normalizeFilters(filters)] as const,
  video: (id: string) => ['video', id] as const,
  jobs: ['jobs'] as const,
  headsets: ['headsets'] as const,
  audiences: ['audiences'] as const,
  sessions: ['sessions'] as const,
  session: (id: string) => ['sessions', id] as const,
}
