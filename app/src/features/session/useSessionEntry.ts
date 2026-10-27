import type { Video } from '../../api/types'
import { useAnnounce } from '../../components/announcerContext'
import { useDraft } from './draftContext'
import { draftReducer, MAX_VIDEOS } from './draftReducer'
import { describeDraft } from './describeDraft'

/** Lien entre une carte du catalogue et le brouillon : position dans la séance, ajout, retrait. */
export function useSessionEntry(video: Video) {
  const { draft, dispatch } = useDraft()
  const announce = useAnnounce()
  const index = draft.videos.findIndex((item) => item.id === video.id)

  function add() {
    const next = draftReducer(draft, { type: 'add', video })
    if (next === draft) return
    dispatch({ type: 'add', video })
    announce(`Ajoutée à la séance (${describeDraft(next, ', ')})`)
  }

  function remove() {
    const next = draftReducer(draft, { type: 'remove', videoId: video.id })
    dispatch({ type: 'remove', videoId: video.id })
    announce(`Retirée de la séance (${describeDraft(next, ', ')})`)
  }

  return {
    /** Numéro dans la séance (1, 2…) ou `null` si la vidéo n'y est pas. */
    position: index === -1 ? null : index + 1,
    isFull: draft.videos.length >= MAX_VIDEOS,
    add,
    remove,
  }
}
