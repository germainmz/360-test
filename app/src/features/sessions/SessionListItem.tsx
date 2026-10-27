import { NavLink } from 'react-router'
import type { Session } from '../../api/types'
import { formatLongDate } from '../../lib/formatDate'
import { formatTotalDuration } from '../../lib/formatDuration'
import { pluralize } from '../../lib/pluralize'

/**
 * Une séance de la liste. Toute la carte est cliquable (le lien est étiré dessus), mais le nom
 * du lien reste court : le nom de la séance. La séance affichée porte `aria-current="page"`.
 */
export function SessionListItem({ session }: { session: Session }) {
  const date = formatLongDate(session.created_at)
  return (
    <li className="group relative flex items-center gap-4 rounded-xl border-2 border-border-subtle bg-surface px-5 py-4 has-[[aria-current=page]]:border-action has-[[aria-current=page]]:bg-action-subtle has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-3 has-[a:focus-visible]:outline-focus">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <NavLink
          to={`/seances/${encodeURIComponent(session.id)}`}
          className="text-lg font-semibold outline-none after:absolute after:inset-0 after:rounded-xl"
        >
          {session.name}
        </NavLink>
        <p className="text-ink-muted">
          {date && `${date} · `}
          {pluralize(session.video_ids.length, 'vidéo')} ·{' '}
          {formatTotalDuration(session.total_duration_seconds)}
        </p>
      </div>
      <span aria-hidden="true" className="shrink-0 font-semibold text-action">
        <span className="underline underline-offset-4 group-has-[[aria-current=page]]:hidden">
          Voir
        </span>
        <span className="hidden group-has-[[aria-current=page]]:inline">Affichée →</span>
      </span>
    </li>
  )
}
