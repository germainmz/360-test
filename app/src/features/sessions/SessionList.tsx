import { Link } from 'react-router'
import type { useSessions } from '../../api/queries'
import { buttonStyles } from '../../components/buttonStyles'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { SlowLoadingMessage } from '../../components/SlowLoadingMessage'
import { SessionListItem } from './SessionListItem'

const SKELETON_COUNT = 3

/** Liste des séances enregistrées (la plus récente en haut) et ses états. */
export function SessionList({ query }: { query: ReturnType<typeof useSessions> }) {
  const { data, isPending, isError, isFetching, refetch } = query

  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        <SlowLoadingMessage isLoading={isFetching}>
          Vos séances mettent plus de temps que d’habitude à arriver…
        </SlowLoadingMessage>
        <ul aria-busy="true" aria-label="Chargement des séances" className="flex flex-col gap-3">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <li
              key={index}
              aria-hidden="true"
              className="flex flex-col gap-2 rounded-xl border-2 border-border-subtle bg-surface px-5 py-4"
            >
              <span className="h-6 w-3/4 animate-pulse rounded bg-surface-muted" />
              <span className="h-5 w-1/2 animate-pulse rounded bg-surface-muted" />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (isError && !data) {
    return (
      <ErrorState onRetry={() => void refetch()}>
        Vos séances n’ont pas pu être chargées.
      </ErrorState>
    )
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title="Vous n’avez pas encore enregistré de séance"
        action={
          <Link to="/" className={buttonStyles.secondary}>
            Préparer une séance
          </Link>
        }
      />
    )
  }

  return (
    <ul aria-label="Séances enregistrées" className="flex flex-col gap-3">
      {data.map((session) => (
        <SessionListItem key={session.id} session={session} />
      ))}
    </ul>
  )
}
