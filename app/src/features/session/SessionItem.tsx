import type { Video } from '../../api/types'
import { formatDuration } from '../../lib/formatDuration'
import { VideoThumbnail } from '../catalog/VideoThumbnail'

export type ItemAction = 'up' | 'down' | 'remove'

interface SessionItemProps {
  video: Video
  index: number
  count: number
  /** Nom du casque choisi si la vidéo n'est pas compatible avec lui. */
  incompatibleWith: string | null
  /** Pendant l'enregistrement : boutons inactifs, l'ordre ne doit plus changer. */
  locked: boolean
  onAction: (action: ItemAction) => void
  registerButton: (action: ItemAction, element: HTMLButtonElement | null) => void
}

const iconButton =
  'flex size-11 shrink-0 items-center justify-center rounded-lg border-2 text-xl font-bold'
const inactive = 'cursor-not-allowed border-border-subtle text-border'

/**
 * Une vidéo de la séance : numéro, miniature, titre, durée, et boutons « Monter », « Descendre »,
 * « Retirer » (sans glisser-déposer : utilisable au doigt, au clavier et au lecteur d'écran).
 * Les boutons impossibles sont `aria-disabled` et non `disabled`, pour ne pas perdre le focus
 * quand une vidéo arrive en première ou dernière position.
 */
export function SessionItem({
  video,
  index,
  count,
  incompatibleWith,
  locked,
  onAction,
  registerButton,
}: SessionItemProps) {
  const upInactive = locked || index === 0
  const downInactive = locked || index === count - 1
  const quoted = `« ${video.title} »`

  return (
    <li className="flex flex-col gap-2 border-b border-border-subtle py-4 last:border-b-0">
      <div className="flex flex-wrap items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-surface"
        >
          {index + 1}
        </span>
        <VideoThumbnail
          src={video.thumbnail_url}
          compact
          className="w-20 shrink-0 rounded-md border border-border-subtle"
        />
        <div className="min-w-0 flex-1 basis-40">
          <p className="leading-6 font-semibold">
            <span className="sr-only">{index + 1}. </span>
            {video.title}
          </p>
          <p className="text-ink-muted">{formatDuration(video.duration_seconds)}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            ref={(element) => registerButton('up', element)}
            onClick={() => onAction('up')}
            aria-disabled={upInactive || undefined}
            aria-label={`Monter ${quoted}`}
            className={`${iconButton} ${upInactive ? inactive : 'border-action text-action hover:bg-action-subtle'}`}
          >
            <span aria-hidden="true">↑</span>
          </button>
          <button
            type="button"
            ref={(element) => registerButton('down', element)}
            onClick={() => onAction('down')}
            aria-disabled={downInactive || undefined}
            aria-label={`Descendre ${quoted}`}
            className={`${iconButton} ${downInactive ? inactive : 'border-action text-action hover:bg-action-subtle'}`}
          >
            <span aria-hidden="true">↓</span>
          </button>
          <button
            type="button"
            ref={(element) => registerButton('remove', element)}
            onClick={() => onAction('remove')}
            aria-disabled={locked || undefined}
            aria-label={`Retirer ${quoted}`}
            className={`${iconButton} ${locked ? inactive : 'border-border text-ink hover:bg-surface-muted'}`}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </div>
      {incompatibleWith && (
        <p className="flex items-center gap-2 rounded-lg bg-warning-subtle px-3 py-2 font-semibold text-accent">
          <span
            aria-hidden="true"
            className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-accent text-sm"
          >
            !
          </span>
          Non compatible avec {incompatibleWith}
        </p>
      )}
    </li>
  )
}
