import type { UseQueryResult } from '@tanstack/react-query'
import { useId, useState } from 'react'
import { useNavigate } from 'react-router'
import { ApiError } from '../../api/ApiError'
import type { Session, Video } from '../../api/types'
import { Button } from '../../components/Button'
import { useDraft } from '../session/draftContext'
import { useSaveSession } from '../session/saveSessionContext'
import { ConfirmReplaceDialog } from './ConfirmReplaceDialog'

interface RestartSessionProps {
  session: Session
  videos: UseQueryResult<Video>[]
}

const isRemoved = (query: UseQueryResult<Video>) =>
  query.error instanceof ApiError && query.error.status === 404

/**
 * « Repartir de cette séance » : copie la séance dans le brouillon puis ouvre « Préparer une
 * séance » (l'API ne permet pas de modifier une séance). Un brouillon en cours, non enregistré,
 * n'est remplacé qu'après confirmation.
 */
export function RestartSession({ session, videos }: RestartSessionProps) {
  const { draft } = useDraft()
  const { startNew } = useSaveSession()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const reasonId = useId()

  const loaded = videos.flatMap((query) => query.data ?? [])
  const removedCount = videos.filter(isRemoved).length
  const isLoading = videos.some((query) => query.isPending)
  const hasFailed = videos.some((query) => query.isError && !isRemoved(query))
  const blockedReason = isLoading
    ? 'Chargement des vidéos de la séance…'
    : hasFailed
      ? 'Une vidéo n’a pas pu être chargée : utilisez « Réessayer » sur la ligne concernée.'
      : loaded.length === 0
        ? 'Aucune vidéo de cette séance n’est encore au catalogue.'
        : null
  const hasUnsavedDraft =
    draft.savedSessionId === null && (draft.videos.length > 0 || draft.name.trim() !== '')

  function restart() {
    setConfirming(false)
    startNew({ name: session.name, headsetId: session.headset_id, videos: loaded })
    void navigate('/')
  }

  function handleClick() {
    if (blockedReason) return
    if (hasUnsavedDraft) setConfirming(true)
    else restart()
  }

  return (
    <div className="flex flex-col items-start gap-2 border-t border-border-subtle pt-5">
      <Button
        onClick={handleClick}
        aria-disabled={blockedReason ? true : undefined}
        aria-describedby={reasonId}
        className={`min-h-13 px-6 ${blockedReason ? 'bg-surface-muted text-ink-muted hover:bg-surface-muted' : ''}`}
      >
        Repartir de cette séance
      </Button>
      <p id={reasonId} className="text-ink-muted">
        {blockedReason ??
          'Ouvre une copie dans « Préparer une séance ». La séance d’origine ne change pas.'}
        {!blockedReason &&
          removedCount > 0 &&
          ` ${removedCount === 1 ? 'Une vidéo n’est plus au catalogue : elle ne sera pas copiée.' : `${removedCount} vidéos ne sont plus au catalogue : elles ne seront pas copiées.`}`}
      </p>
      <ConfirmReplaceDialog
        isOpen={confirming}
        onCancel={() => setConfirming(false)}
        onConfirm={restart}
        draft={draft}
        sessionName={session.name}
      />
    </div>
  )
}
