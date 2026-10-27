import { useId } from 'react'
import { Link, useParams } from 'react-router'
import { ApiError } from '../../api/ApiError'
import { useSession, useVideosByIds } from '../../api/queries'
import { ErrorState } from '../../components/ErrorState'
import { SlowLoadingMessage } from '../../components/SlowLoadingMessage'
import { useFocusOnNavigation } from '../../hooks/useFocusOnNavigation'
import { formatLongDate } from '../../lib/formatDate'
import { formatTotalDuration } from '../../lib/formatDuration'
import { pluralize } from '../../lib/pluralize'
import { useCatalogReferences } from '../catalog/useCatalogReferences'
import { RestartSession } from './RestartSession'
import { SessionVideoItem } from './SessionVideoItem'

/** Détail d'une séance enregistrée (`/seances/:id`), affiché à côté de la liste. */
export function SessionDetailPage() {
  const { id = '' } = useParams()
  const session = useSession(id)
  const videos = useVideosByIds(session.data?.video_ids ?? [])
  const { jobsByCode, headsetsById } = useCatalogReferences()
  // Après un clic sur « Voir », le focus va sur le nom de la séance, une fois chargée.
  const headingRef = useFocusOnNavigation<HTMLHeadingElement>(id, session.isSuccess)
  const headingId = useId()

  if (session.isPending) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <SlowLoadingMessage isLoading={session.isFetching}>
          La séance met plus de temps que d’habitude à arriver…
        </SlowLoadingMessage>
        <span className="h-8 w-2/3 animate-pulse rounded bg-surface-muted" />
        <span className="h-5 w-1/3 animate-pulse rounded bg-surface-muted" />
      </div>
    )
  }

  if (session.isError) {
    if (session.error instanceof ApiError && session.error.status === 404) {
      return (
        <div className="flex flex-col items-start gap-4 rounded-xl bg-surface px-6 py-8">
          <h2 className="text-2xl font-bold">Séance introuvable</h2>
          <p className="text-lg">Cette séance n’existe pas ou n’est plus disponible.</p>
          <Link to="/seances" className="text-lg font-semibold text-action underline">
            Voir toutes mes séances
          </Link>
        </div>
      )
    }
    return (
      <ErrorState onRetry={() => void session.refetch()}>
        Cette séance n’a pas pu être chargée.
      </ErrorState>
    )
  }

  const { data } = session
  const date = formatLongDate(data.created_at)
  const headset = data.headset_id ? headsetsById.get(data.headset_id)?.name : null

  return (
    <article
      aria-labelledby={headingId}
      className="flex flex-col gap-5 rounded-xl border-2 border-border-subtle bg-surface p-6"
    >
      <div className="flex flex-col gap-1">
        {date && <p className="text-ink-muted">Enregistrée le {date}</p>}
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold outline-offset-4"
        >
          {data.name}
        </h2>
        <p className="text-lg font-semibold">
          {pluralize(data.video_ids.length, 'vidéo')} ·{' '}
          {formatTotalDuration(data.total_duration_seconds)}
          {headset && <span className="font-normal text-ink-muted"> · Casque : {headset}</span>}
        </p>
      </div>

      <ol
        aria-label="Vidéos de la séance, dans l’ordre de diffusion"
        className="border-t border-border-subtle"
      >
        {videos.map((query, index) => (
          <SessionVideoItem
            key={data.video_ids[index]}
            position={index + 1}
            query={query}
            jobsByCode={jobsByCode}
          />
        ))}
      </ol>

      <RestartSession session={data} videos={videos} />
    </article>
  )
}
