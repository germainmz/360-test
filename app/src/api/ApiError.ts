import type { ApiErrorBody, ApiErrorDetail } from './types'

/**
 * - `network` : le serveur n'a pas répondu (hors ligne, CORS, coupure).
 * - `client` : 4xx, la requête est en cause ; la renvoyer telle quelle ne sert à rien.
 * - `server` : 5xx, erreur passagère ; un nouvel essai peut réussir.
 */
export type ApiErrorKind = 'network' | 'client' | 'server'

export class ApiError extends Error {
  override readonly name = 'ApiError'
  readonly kind: ApiErrorKind
  /** `null` pour une erreur réseau. */
  readonly status: number | null
  readonly code: string
  readonly details: ApiErrorDetail[]

  constructor(kind: ApiErrorKind, status: number | null, body: ApiErrorBody) {
    super(body.message ?? body.error)
    this.kind = kind
    this.status = status
    this.code = body.error
    this.details = body.details ?? []
  }

  get isRetryable(): boolean {
    return this.kind !== 'client'
  }

  /** Messages de validation (422) par champ, ex. `{ name: 'Le nom est obligatoire.' }`. */
  fieldErrors(): Partial<Record<string, string>> {
    const errors: Partial<Record<string, string>> = {}
    for (const { field, message } of this.details) errors[field] ??= message
    return errors
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isErrorDetail(value: unknown): value is ApiErrorDetail {
  return isObject(value) && typeof value.field === 'string' && typeof value.message === 'string'
}

export function parseErrorBody(value: unknown, status: number): ApiErrorBody {
  if (!isObject(value) || typeof value.error !== 'string') {
    return { error: 'http_error', message: `Erreur HTTP ${status}` }
  }
  return {
    error: value.error,
    message: typeof value.message === 'string' ? value.message : undefined,
    details: Array.isArray(value.details) ? value.details.filter(isErrorDetail) : undefined,
  }
}
