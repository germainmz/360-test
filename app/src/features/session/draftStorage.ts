import type { Video } from '../../api/types'
import { emptyDraft, MAX_VIDEOS, type Draft } from './draftReducer'

/** Clé versionnée : si le format change, on passe à v2 sans lire un ancien brouillon incompatible. */
export const DRAFT_STORAGE_KEY = 'm360.draft.v1'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isVideo(value: unknown): value is Video {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    typeof value.duration_seconds === 'number' &&
    isStringArray(value.jobs) &&
    isStringArray(value.audiences) &&
    isStringArray(value.compatible_headsets) &&
    (typeof value.thumbnail_url === 'string' || value.thumbnail_url === null) &&
    typeof value.published_at === 'string'
  )
}

/**
 * Relit le brouillon enregistré. Contenu absent, illisible ou d'un autre format : on repart
 * d'un brouillon vide plutôt que de bloquer l'application. Les vidéos invalides sont écartées.
 */
export function parseDraft(raw: string | null): Draft {
  if (!raw) return emptyDraft
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return emptyDraft
  }
  if (!isObject(value)) return emptyDraft

  const seen = new Set<string>()
  const videos = (Array.isArray(value.videos) ? value.videos : [])
    .filter(isVideo)
    .filter((video) => !seen.has(video.id) && seen.add(video.id))
    .slice(0, MAX_VIDEOS)

  return {
    name: typeof value.name === 'string' ? value.name : '',
    headsetId: typeof value.headsetId === 'string' ? value.headsetId : null,
    videos,
  }
}

// localStorage peut être indisponible (navigation privée, quota plein) : on n'échoue jamais.

export function loadDraft(): Draft {
  try {
    return parseDraft(window.localStorage.getItem(DRAFT_STORAGE_KEY))
  } catch {
    return emptyDraft
  }
}

export function saveDraft(draft: Draft): void {
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // Le brouillon reste en mémoire ; seule la survie au rechargement est perdue.
  }
}
