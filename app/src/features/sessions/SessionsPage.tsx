import { Link, Outlet, useParams } from 'react-router'
import { useSession, useSessions } from '../../api/queries'
import { usePageTitle } from '../../components/usePageTitle'
import { useFocusOnNavigation } from '../../hooks/useFocusOnNavigation'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { pluralize } from '../../lib/pluralize'
import { SessionList } from './SessionList'

/** Même seuil que le panneau de « Préparer une séance » : tablette paysage et au-delà. */
const WIDE_SCREEN = '(min-width: 1024px)'

/**
 * « Mes séances » : liste à gauche, détail de la séance choisie à droite (`/seances/:id`). En
 * tablette portrait, la liste et le détail s'affichent l'un après l'autre, avec un lien retour.
 */
export function SessionsPage() {
  const { id } = useParams()
  const isWide = useMediaQuery(WIDE_SCREEN, true)
  const sessions = useSessions()
  const selected = useSession(id)
  usePageTitle(id ? `${selected.data?.name ?? 'Séance'} · Mes séances` : 'Mes séances')
  // Le détail gère son propre focus ; ici, seulement en arrivant sur la liste.
  const headingRef = useFocusOnNavigation<HTMLHeadingElement>(id ? null : 'list')
  const showList = isWide || !id

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-[32px] leading-10 font-bold outline-offset-4"
        >
          Mes séances
        </h1>
        {sessions.data && (
          <p className="text-lg text-ink-muted">{pluralize(sessions.data.length, 'séance')}</p>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(18rem,26rem)_minmax(0,1fr)] lg:items-start lg:gap-8">
        {showList && (
          <section aria-label="Liste des séances" className="flex flex-col gap-3">
            <p className="text-ink-muted">La plus récente en haut</p>
            <SessionList query={sessions} />
          </section>
        )}
        {id ? (
          <div className="flex flex-col gap-4">
            {!isWide && (
              <Link
                to="/seances"
                className="flex min-h-11 items-center self-start text-lg font-semibold text-action underline underline-offset-4"
              >
                <span aria-hidden="true">←&nbsp;</span>Toutes mes séances
              </Link>
            )}
            <Outlet />
          </div>
        ) : (
          isWide &&
          sessions.data &&
          sessions.data.length > 0 && (
            <p className="rounded-xl border-2 border-dashed border-border px-6 py-10 text-center text-lg text-ink-muted">
              Choisissez une séance pour voir ses vidéos.
            </p>
          )
        )}
      </div>
    </div>
  )
}
