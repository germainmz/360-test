import type { UseQueryResult } from '@tanstack/react-query'
import { ApiError } from '../../api/ApiError'
import type { Video } from '../../api/types'
import { Button } from '../../components/Button'
import { formatDuration } from '../../lib/formatDuration'
import { VideoThumbnail } from '../catalog/VideoThumbnail'
import type { CatalogReferences } from '../catalog/useCatalogReferences'

interface SessionVideoItemProps {
  position: number
  query: UseQueryResult<Video>
  jobsByCode: CatalogReferences['jobsByCode']
}

// Sur un écran étroit (320 px, zoom 200 %), le titre et la durée passent sous la miniature.
const rowClass =
  'flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border-subtle py-4 last:border-b-0'

function Position({ value }: { value: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-surface"
    >
      {value}
    </span>
  )
}

/** Une vidéo de la séance enregistrée, chargée à part : chacune a ses propres états. */
export function SessionVideoItem({ position, query, jobsByCode }: SessionVideoItemProps) {
  const { data: video, isPending, error, refetch } = query

  if (isPending) {
    return (
      <li aria-hidden="true" className={rowClass}>
        <Position value={position} />
        <span className="aspect-video w-24 shrink-0 animate-pulse rounded-md bg-surface-muted" />
        <span className="h-6 w-1/2 animate-pulse rounded bg-surface-muted" />
      </li>
    )
  }

  if (!video) {
    const removed = error instanceof ApiError && error.status === 404
    return (
      <li className={rowClass}>
        <Position value={position} />
        <p className="min-w-0 flex-1 font-semibold">
          <span className="sr-only">{position}. </span>
          {removed
            ? 'Cette vidéo n’est plus au catalogue.'
            : 'Cette vidéo n’a pas pu être chargée.'}
        </p>
        {!removed && (
          <Button variant="secondary" onClick={() => void refetch()}>
            Réessayer
          </Button>
        )}
      </li>
    )
  }

  const jobLabels = video.jobs.flatMap((code) => jobsByCode.get(code)?.label ?? [])
  return (
    <li className={rowClass}>
      <Position value={position} />
      <VideoThumbnail
        src={video.thumbnail_url}
        compact
        className="w-24 shrink-0 rounded-md border border-border-subtle"
      />
      <div className="min-w-0 flex-1 basis-48">
        <p className="leading-6 font-semibold">
          <span className="sr-only">{position}. </span>
          {video.title}
        </p>
        {jobLabels.length > 0 && <p className="text-ink-muted">{jobLabels.join(' · ')}</p>}
      </div>
      <p className="shrink-0 text-ink-muted">
        <span className="sr-only">Durée : </span>
        {formatDuration(video.duration_seconds)}
      </p>
    </li>
  )
}
