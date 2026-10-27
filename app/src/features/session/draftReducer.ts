import type { Video } from '../../api/types'

/** Limite de l'API (`POST /sessions` : 1 à 30 vidéos). */
export const MAX_VIDEOS = 30

/**
 * Brouillon de la séance en cours. On garde les objets `Video` complets (pas seulement les ids)
 * pour afficher le panneau sans requête, même hors ligne ou après un rechargement.
 */
export interface Draft {
  name: string
  headsetId: string | null
  videos: Video[]
  /**
   * Identifiant de la séance une fois enregistrée. Le brouillon reste alors affiché en
   * confirmation mais n'est plus modifiable : une modification ne serait pas enregistrée.
   */
  savedSessionId: string | null
}

export type DraftAction =
  | { type: 'add'; video: Video }
  | { type: 'remove'; videoId: string }
  | { type: 'moveUp'; videoId: string }
  | { type: 'moveDown'; videoId: string }
  | { type: 'moveTo'; videoId: string; index: number }
  | { type: 'rename'; name: string }
  | { type: 'setHeadset'; headsetId: string | null }
  | { type: 'saved'; sessionId: string }
  | { type: 'reset' }

export const emptyDraft: Draft = { name: '', headsetId: null, videos: [], savedSessionId: null }

function move(videos: Video[], videoId: string, target: number): Video[] {
  const from = videos.findIndex((video) => video.id === videoId)
  const to = Math.min(Math.max(target, 0), videos.length - 1)
  if (from === -1 || from === to) return videos
  const next = [...videos]
  const [moved] = next.splice(from, 1)
  if (moved) next.splice(to, 0, moved)
  return next
}

function indexOf(draft: Draft, videoId: string): number {
  return draft.videos.findIndex((video) => video.id === videoId)
}

/**
 * Toutes les règles du brouillon sont ici : pas de doublon, 30 vidéos au plus. Une action
 * impossible renvoie le brouillon inchangé (même objet), sans erreur.
 */
export function draftReducer(draft: Draft, action: DraftAction): Draft {
  // Séance enregistrée : seul « Préparer une nouvelle séance » (reset) la quitte.
  if (draft.savedSessionId !== null && action.type !== 'reset') return draft
  switch (action.type) {
    case 'add':
      if (draft.videos.length >= MAX_VIDEOS || indexOf(draft, action.video.id) !== -1) return draft
      return { ...draft, videos: [...draft.videos, action.video] }
    case 'remove':
      if (indexOf(draft, action.videoId) === -1) return draft
      return { ...draft, videos: draft.videos.filter((video) => video.id !== action.videoId) }
    case 'moveUp':
    case 'moveDown': {
      const from = indexOf(draft, action.videoId)
      const videos = move(draft.videos, action.videoId, from + (action.type === 'moveUp' ? -1 : 1))
      return videos === draft.videos ? draft : { ...draft, videos }
    }
    case 'moveTo': {
      const videos = move(draft.videos, action.videoId, action.index)
      return videos === draft.videos ? draft : { ...draft, videos }
    }
    case 'rename':
      return action.name === draft.name ? draft : { ...draft, name: action.name }
    case 'setHeadset':
      return action.headsetId === draft.headsetId
        ? draft
        : { ...draft, headsetId: action.headsetId }
    case 'saved':
      return { ...draft, savedSessionId: action.sessionId }
    case 'reset':
      return emptyDraft
  }
}

export function totalDurationSeconds(draft: Draft): number {
  return draft.videos.reduce((total, video) => total + video.duration_seconds, 0)
}

/** Vidéo incompatible avec le casque choisi ; sans casque choisi, rien n'est signalé. */
export function isIncompatible(video: Video, headsetId: string | null): boolean {
  return headsetId !== null && !video.compatible_headsets.includes(headsetId)
}
