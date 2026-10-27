import { MAX_VIDEOS, type Draft } from './draftReducer'

/** Limite de l'API (`POST /sessions` : nom de 120 caractères au plus, après trim). */
export const NAME_MAX_LENGTH = 120

/** Champs de la séance tels que l'API les nomme dans `details[].field`. */
export type SessionField = 'name' | 'video_ids' | 'headset_id'

export type FieldErrors = Partial<Record<SessionField, string>>

/**
 * Mêmes règles que l'API, vérifiées avant l'envoi pour répondre tout de suite, sans attendre
 * le serveur. Renvoie un objet vide si la séance peut être envoyée.
 */
export function validateDraft(draft: Draft): FieldErrors {
  const errors: FieldErrors = {}
  const name = draft.name.trim()
  if (!name) errors.name = 'Le nom est obligatoire.'
  else if (name.length > NAME_MAX_LENGTH)
    errors.name = `Le nom ne doit pas dépasser ${NAME_MAX_LENGTH} caractères.`

  if (draft.videos.length === 0)
    errors.video_ids = 'Ajoutez au moins une vidéo depuis le catalogue.'
  else if (draft.videos.length > MAX_VIDEOS)
    errors.video_ids = `Une séance contient au plus ${MAX_VIDEOS} vidéos.`
  return errors
}
