import { useId } from 'react'
import { useDraft } from './draftContext'
import { MAX_VIDEOS } from './draftReducer'
import { describeDraft } from './describeDraft'
import { useSaveSession } from './saveSessionContext'

/**
 * Pied du panneau, toujours visible : résumé de la séance et bouton d'enregistrement. Le même
 * bouton passe par « Enregistrer la séance », « Enregistrement… » et « Réessayer » : le focus
 * reste dessus pendant tout l'envoi.
 */
export function SessionFooter() {
  const { draft } = useDraft()
  const { isSaving, hasFailed, save } = useSaveSession()
  const failureId = useId()

  return (
    <div className="flex flex-col gap-4 border-t border-border-subtle px-6 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xl font-bold">{describeDraft(draft)}</p>
        <p className="text-base text-ink-muted">
          {draft.videos.length >= MAX_VIDEOS ? 'Limite atteinte' : `${MAX_VIDEOS} vidéos maximum`}
        </p>
      </div>
      {hasFailed && !isSaving && (
        <div
          role="alert"
          id={failureId}
          className="flex items-start gap-3 rounded-xl border-2 border-danger bg-danger-subtle px-4 py-3"
        >
          <span
            aria-hidden="true"
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-danger text-sm font-bold text-surface"
          >
            !
          </span>
          <p className="font-semibold text-danger">
            L’enregistrement a échoué. Votre séance est conservée.
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={save}
        aria-disabled={isSaving || undefined}
        aria-describedby={hasFailed && !isSaving ? failureId : undefined}
        className={`inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-lg px-5 text-lg font-semibold ${
          isSaving
            ? 'cursor-not-allowed bg-surface-muted text-ink'
            : 'bg-action text-surface hover:bg-action-hover'
        }`}
      >
        {isSaving ? (
          <>
            <span
              aria-hidden="true"
              className="size-5 animate-spin rounded-full border-[3px] border-ink border-t-transparent"
            />
            Enregistrement…
          </>
        ) : hasFailed ? (
          'Réessayer'
        ) : (
          'Enregistrer la séance'
        )}
      </button>
    </div>
  )
}
