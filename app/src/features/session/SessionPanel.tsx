import { useId, useLayoutEffect, useRef } from 'react'
import { useHeadsets } from '../../api/queries'
import { useAnnounce } from '../../components/announcerContext'
import { Button } from '../../components/Button'
import { useCatalogFilters } from '../catalog/useCatalogFilters'
import { useDraft } from './draftContext'
import { draftReducer, isIncompatible, MAX_VIDEOS, type DraftAction } from './draftReducer'
import { describeDraft } from './describeDraft'
import { SessionItem, type ItemAction } from './SessionItem'

const NAME_MAX_LENGTH = 120

interface SessionPanelProps {
  headingId: string
  /** Présent dans le tiroir (tablette portrait) : affiche un bouton « Fermer ». */
  onClose?: () => void
}

/**
 * Panneau « Ma séance » : nom, casque, liste ordonnée des vidéos et résumé toujours visible.
 * Après chaque action, le focus est replacé à un endroit logique et l'action est annoncée.
 */
export function SessionPanel({ headingId, onClose }: SessionPanelProps) {
  const { draft, dispatch } = useDraft()
  const announce = useAnnounce()
  const headsets = useHeadsets()
  const { filters, update } = useCatalogFilters()
  const nameId = useId()
  const nameHintId = useId()
  const headsetFieldId = useId()

  const headingRef = useRef<HTMLHeadingElement>(null)
  const buttons = useRef(new Map<string, HTMLButtonElement>())
  /** Élément à focaliser après le prochain rendu de la liste (« id:action » ou le titre). */
  const pendingFocus = useRef<string | null>(null)

  useLayoutEffect(() => {
    const target = pendingFocus.current
    if (target === null) return
    pendingFocus.current = null
    if (target === 'heading') headingRef.current?.focus()
    else buttons.current.get(target)?.focus()
  }, [draft.videos])

  const headsetName = headsets.data?.find((headset) => headset.id === draft.headsetId)?.name ?? null
  const incompatibleCount = draft.videos.filter((video) =>
    isIncompatible(video, draft.headsetId),
  ).length

  function apply(action: DraftAction, message: (next: typeof draft) => string) {
    const next = draftReducer(draft, action)
    if (next === draft) return
    dispatch(action)
    announce(message(next))
  }

  function handleItemAction(videoId: string, index: number, action: ItemAction) {
    const video = draft.videos[index]
    if (!video) return
    if (action === 'up' || action === 'down') {
      const target = action === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= draft.videos.length) return
      // Le focus reste sur le même bouton de la vidéo déplacée.
      pendingFocus.current = `${videoId}:${action}`
      apply(
        { type: action === 'up' ? 'moveUp' : 'moveDown', videoId },
        () => `Déplacée en position ${target + 1}`,
      )
      return
    }
    const neighbour = draft.videos[index + 1] ?? draft.videos[index - 1]
    pendingFocus.current = neighbour ? `${neighbour.id}:remove` : 'heading'
    apply(
      { type: 'remove', videoId },
      (next) => `« ${video.title} » retirée de la séance (${describeDraft(next, ', ')})`,
    )
  }

  function filterCatalogOnHeadset() {
    if (!draft.headsetId) return
    update({ headset: draft.headsetId })
    announce(`Catalogue filtré : vidéos compatibles avec ${headsetName ?? 'ce casque'}`)
    onClose?.()
  }

  return (
    <div className="flex max-h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
        <div className="flex items-center justify-between gap-4">
          <h2
            id={headingId}
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold outline-offset-4"
          >
            Ma séance
          </h2>
          {onClose && (
            <Button variant="secondary" onClick={onClose} className="border-border text-ink">
              Fermer <span aria-hidden="true">✕</span>
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={nameId} className="text-lg font-semibold">
            Nom de la séance <span className="font-normal text-ink-muted">(obligatoire)</span>
          </label>
          <input
            id={nameId}
            value={draft.name}
            onChange={(event) => dispatch({ type: 'rename', name: event.target.value })}
            maxLength={NAME_MAX_LENGTH}
            aria-describedby={nameHintId}
            autoComplete="off"
            placeholder="ex. : Atelier découverte — 2nde C"
            className="h-13 w-full rounded-[10px] border-2 border-border bg-surface px-4 text-lg placeholder:text-ink-muted"
          />
          <p className="self-end text-base text-ink-muted">
            <span aria-hidden="true">
              {draft.name.length} / {NAME_MAX_LENGTH}
            </span>
            <span id={nameHintId} className="sr-only">
              {NAME_MAX_LENGTH} caractères au maximum.
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={headsetFieldId} className="text-lg font-semibold">
            Casque utilisé <span className="font-normal text-ink-muted">(facultatif)</span>
          </label>
          <div className="relative">
            <select
              id={headsetFieldId}
              value={draft.headsetId ?? ''}
              onChange={(event) =>
                dispatch({ type: 'setHeadset', headsetId: event.target.value || null })
              }
              className="h-13 w-full cursor-pointer appearance-none rounded-[10px] border-2 border-border bg-surface pr-11 pl-4 text-lg"
            >
              <option value="">Choisir un casque</option>
              {headsets.data?.map((headset) => (
                <option key={headset.id} value={headset.id}>
                  {headset.name}
                </option>
              ))}
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-4.5 right-4.5 size-2.5 rotate-45 border-r-[3px] border-b-[3px] border-ink"
            />
          </div>
        </div>

        {incompatibleCount > 0 && headsetName && (
          <div className="flex flex-col gap-3 rounded-xl bg-warning-subtle px-4 py-3">
            <p className="font-semibold text-accent">
              {incompatibleCount === 1
                ? `1 vidéo n’est pas compatible avec ${headsetName}.`
                : `${incompatibleCount} vidéos ne sont pas compatibles avec ${headsetName}.`}
            </p>
            {filters.headset !== draft.headsetId && (
              <Button variant="secondary" onClick={filterCatalogOnHeadset}>
                Afficher seulement les vidéos compatibles
              </Button>
            )}
          </div>
        )}

        {draft.videos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border px-4 py-10 text-center">
            <p className="font-semibold">Ajoutez des vidéos depuis le catalogue</p>
            <p className="text-ink-muted">Elles s’afficheront ici, dans l’ordre de diffusion.</p>
          </div>
        ) : (
          <ol aria-label="Vidéos de la séance, dans l’ordre de diffusion">
            {draft.videos.map((video, index) => (
              <SessionItem
                key={video.id}
                video={video}
                index={index}
                count={draft.videos.length}
                incompatibleWith={isIncompatible(video, draft.headsetId) ? headsetName : null}
                onAction={(action) => handleItemAction(video.id, index, action)}
                registerButton={(action, element) => {
                  const key = `${video.id}:${action}`
                  if (element) buttons.current.set(key, element)
                  else buttons.current.delete(key)
                }}
              />
            ))}
          </ol>
        )}
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border-subtle px-6 py-4">
        <p className="text-xl font-bold">{describeDraft(draft)}</p>
        <p className="text-base text-ink-muted">
          {draft.videos.length >= MAX_VIDEOS ? 'Limite atteinte' : `${MAX_VIDEOS} vidéos maximum`}
        </p>
      </div>
    </div>
  )
}
