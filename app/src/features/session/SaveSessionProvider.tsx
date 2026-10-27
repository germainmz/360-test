import { useState, type ReactNode } from 'react'
import { ApiError } from '../../api/ApiError'
import { useCreateSession } from '../../api/queries'
import { useAnnounce } from '../../components/announcerContext'
import { useDraft } from './draftContext'
import type { Draft } from './draftReducer'
import { SaveSessionContext, type DraftContent } from './saveSessionContext'
import { validateDraft, type FieldErrors, type SessionField } from './validateDraft'

const SESSION_FIELDS: SessionField[] = ['name', 'video_ids', 'headset_id']

/** Garde les messages du serveur (422) qui portent sur un champ du panneau. */
function sessionFieldErrors(error: Error | null): FieldErrors {
  if (!(error instanceof ApiError) || error.kind !== 'client') return {}
  const byField = error.fieldErrors()
  const errors: FieldErrors = {}
  for (const field of SESSION_FIELDS) {
    const message = byField[field]
    if (message) errors[field] = message
  }
  return errors
}

/** Brouillon tel qu'il était au moment du refus, pour savoir quels champs ont été corrigés depuis. */
interface Rejection {
  errors: FieldErrors
  draft: Draft
}

/**
 * Enregistrement de la séance, placé au-dessus des pages (comme le brouillon) : fermer le tiroir
 * pendant l'envoi ne perd ni la réponse ni le message d'échec.
 */
export function SaveSessionProvider({ children }: { children: ReactNode }) {
  const { draft, dispatch } = useDraft()
  const announce = useAnnounce()
  const createSession = useCreateSession()
  const [rejection, setRejection] = useState<Rejection | null>(null)
  const [errorFocusRequest, setErrorFocusRequest] = useState(0)

  function reject(errors: FieldErrors, rejectedDraft: Draft) {
    setRejection({ errors, draft: rejectedDraft })
    setErrorFocusRequest((count) => count + 1)
  }

  function save() {
    if (createSession.isPending || draft.savedSessionId !== null) return
    const errors = validateDraft(draft)
    if (Object.keys(errors).length > 0) {
      reject(errors, draft)
      return
    }
    setRejection(null)
    const sent = draft
    createSession.mutate(
      {
        name: sent.name.trim(),
        video_ids: sent.videos.map((video) => video.id),
        headset_id: sent.headsetId,
      },
      {
        // La confirmation (role="status") remplace le panneau et reçoit le focus : pas d'annonce
        // en plus, elle serait lue deux fois.
        onSuccess: (session) => dispatch({ type: 'saved', sessionId: session.id }),
        onError: (error) => {
          const serverErrors = sessionFieldErrors(error)
          if (Object.keys(serverErrors).length > 0) reject(serverErrors, sent)
        },
      },
    )
  }

  function startNew(from?: DraftContent) {
    dispatch(from ? { type: 'load', ...from } : { type: 'reset' })
    createSession.reset()
    setRejection(null)
    announce(
      from
        ? `Copie de « ${from.name} » prête dans « Préparer une séance ».`
        : 'Nouvelle séance : le brouillon est vide.',
    )
  }

  // Un message disparaît dès que le champ concerné a été modifié.
  const errors: FieldErrors = {}
  if (rejection) {
    const { errors: rejected, draft: before } = rejection
    if (rejected.name && draft.name === before.name) errors.name = rejected.name
    if (rejected.video_ids && draft.videos === before.videos) errors.video_ids = rejected.video_ids
    if (rejected.headset_id && draft.headsetId === before.headsetId)
      errors.headset_id = rejected.headset_id
  }

  const hasFailed =
    createSession.isError && Object.keys(sessionFieldErrors(createSession.error)).length === 0

  const value = {
    isSaving: createSession.isPending,
    hasFailed,
    errors,
    errorFocusRequest,
    save,
    startNew,
  }
  return <SaveSessionContext.Provider value={value}>{children}</SaveSessionContext.Provider>
}
