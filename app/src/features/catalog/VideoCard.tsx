import { forwardRef, useId } from 'react'
import type { Video } from '../../api/types'
import { formatDuration } from '../../lib/formatDuration'
import type { CatalogReferences } from './useCatalogReferences'
import { VideoThumbnail } from './VideoThumbnail'

interface VideoCardProps {
  video: Video
  references: Pick<CatalogReferences, 'jobsByCode' | 'audiencesById'>
  onAdd: (video: Video) => void
}

/**
 * Carte d'une vidéo du catalogue. Le ref vise le titre (focusable par script seulement) : après
 * « Afficher plus de vidéos », le focus est placé sur le titre de la première nouvelle carte.
 */
export const VideoCard = forwardRef<HTMLHeadingElement, VideoCardProps>(function VideoCard(
  { video, references, onAdd },
  titleRef,
) {
  const titleId = useId()
  // Jamais de code ROME seul : un métier inconnu du référentiel n'est simplement pas affiché.
  const jobLabels = video.jobs.flatMap((code) => references.jobsByCode.get(code)?.label ?? [])
  const audienceLabels = video.audiences.flatMap(
    (id) => references.audiencesById.get(id)?.label ?? [],
  )

  return (
    <article
      aria-labelledby={titleId}
      className="flex h-full flex-col overflow-hidden rounded-xl border-2 border-border-subtle bg-surface"
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
        <button
          type="button"
          onClick={() => onAdd(video)}
          className="mt-auto min-h-12 rounded-lg border-2 border-action bg-surface px-4 text-lg font-semibold text-action hover:bg-action-subtle"
        >
          <span aria-hidden="true">+ </span>Ajouter à la séance
          <span className="sr-only"> : {video.title}</span>
        </button>
      </div>
    </article>
  )
})
