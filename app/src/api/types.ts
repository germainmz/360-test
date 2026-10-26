/** Contrats de l'API, écrits d'après API.md (source de vérité). Durées en secondes. */

export interface Video {
  id: string
  title: string
  description: string
  duration_seconds: number
  /** Codes ROME. */
  jobs: string[]
  /** Identifiants de publics. */
  audiences: string[]
  /** Identifiants de casques. */
  compatible_headsets: string[]
  thumbnail_url: string | null
  /** Date ISO `AAAA-MM-JJ`. */
  published_at: string
}

export interface PaginationMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ListResponse<T> {
  data: T[]
}

export interface Domain {
  code: string
  label: string
}

export interface Job {
  /** Code ROME, ex. `I1604`. Ne jamais l'afficher seul : toujours avec `label`. */
  code: string
  label: string
  major_domain: Domain
  professional_domain: Domain
  appellations: string[]
}

export interface JobsResponse extends ListResponse<Job> {
  source: string
}

export interface Headset {
  id: string
  name: string
}

export interface Audience {
  id: string
  label: string
}

export interface Session {
  id: string
  name: string
  /** Dans l'ordre de diffusion. */
  video_ids: string[]
  headset_id: string | null
  /** Date-heure ISO. */
  created_at: string
  total_duration_seconds: number
}

export interface SessionInput {
  name: string
  video_ids: string[]
  headset_id?: string | null
}

export interface ApiErrorDetail {
  field: string
  message: string
}

export interface ApiErrorBody {
  error: string
  message?: string
  details?: ApiErrorDetail[]
}
