import { forwardRef, useId } from 'react'
import type { Video } from '../../api/types'
import { formatDuration } from '../../lib/formatDuration'
import { MAX_VIDEOS } from '../session/draftReducer'
import { useSessionEntry } from '../session/useSessionEntry'
import type { CatalogReferences } from './useCatalogReferences'
import { VideoThumbnail } from './VideoThumbnail'

interface VideoCardProps {
  video: Video
  references: Pick<CatalogReferences, 'jobsByCode' | 'audiencesById'>
}

/**
 * Carte d'une vidéo du catalogue. Le ref vise le titre (focusable par script seulement) : après
 * « Afficher plus de vidéos », le focus est placé sur le titre de la première nouvelle carte.
 */
export const VideoCard = forwardRef<HTMLHeadingElement, VideoCardProps>(function VideoCard(
  { video, references },
  titleRef,
) {
  const titleId = useId()
  const limitId = useId()
  const { position, isFull, add, remove } = useSessionEntry(video)
  const inSession = position !== null
  const blocked = !inSession && isFull
  // Jamais de code ROME seul : un métier inconnu du référentiel n'est simplement pas affiché.
  const jobLabels = video.jobs.flatMap((code) => references.jobsByCode.get(code)?.label ?? [])
  const audienceLabels = video.audiences.flatMap(
    (id) => references.audiencesById.get(id)?.label ?? [],
  )

  return (
    <article
      aria-labelledby={titleId}
      className={`flex h-full flex-col overflow-hidden rounded-xl border-2 bg-surface ${inSession ? 'border-action' : 'border-border-subtle'}`}
    >
      <VideoThumbnail src={video.thumbnail_url} />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3
          id={titleId}
          ref={titleRef}
          tabIndex={-1}
          className="text-xl leading-7 font-semibold outline-offset-4"
        >
          {video.title}
        </h3>
        {jobLabels.length > 0 && <p className="font-semibold">{jobLabels.join(' · ')}</p>}
        <p className="text-ink-muted">
          <span className="sr-only">Durée : </span>
          {formatDuration(video.duration_seconds)}
        </p>
        {audienceLabels.length > 0 && (
          <p className="text-ink-muted">
            <span className="sr-only">Public conseillé : </span>
            {audienceLabels.join(', ')}
          </p>
        )}
        {/* Un seul et même bouton change de libellé : le focus clavier n'est pas perdu au clic. */}
        <div className="mt-auto flex flex-col gap-2 pt-2">
          {inSession && (
            <p className="flex items-center gap-2 font-semibold text-success">
              <span
                aria-hidden="true"
                className="flex size-6 items-center justify-center rounded-full bg-success text-sm text-surface"
              >
                ✓
              </span>
              Dans la séance · n° {position}
            </p>
          )}
          <button
            type="button"
            onClick={inSession ? remove : blocked ? undefined : add}
            aria-disabled={blocked || undefined}
            aria-describedby={blocked ? limitId : undefined}
            // Le titre distingue les boutons pour les lecteurs d'écran ; le nom commence par le
            // texte visible, pour la commande vocale (« Ajouter à la séance »).
            aria-label={
              inSession
                ? `Retirer de la séance : ${video.title}`
                : `Ajouter à la séance : ${video.title}`
            }
            className={`min-h-12 rounded-lg border-2 px-4 text-lg font-semibold ${
              blocked
                ? 'cursor-not-allowed border-dashed border-border bg-surface-muted text-ink-muted'
                : 'border-action bg-surface text-action hover:bg-action-subtle'
            }`}
          >
            {inSession ? 'Retirer' : '+ Ajouter à la séance'}
          </button>
          {blocked && (
            <p id={limitId} className="text-base text-ink-muted">
              La séance contient déjà {MAX_VIDEOS} vidéos.
            </p>
          )}
        </div>
      </div>
    </article>
  )
})
