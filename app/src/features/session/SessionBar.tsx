import { forwardRef } from 'react'
import { Button } from '../../components/Button'
import { useDraft } from './draftContext'
import { describeDraft } from './describeDraft'

interface SessionBarProps {
  onOpen: () => void
}

/** Tablette portrait : barre fixe en bas, résumé de la séance toujours visible pendant la recherche. */
export const SessionBar = forwardRef<HTMLButtonElement, SessionBarProps>(function SessionBar(
  { onOpen },
  ref,
) {
  const { draft } = useDraft()
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 border-t border-border-subtle bg-surface px-6 py-4 shadow-[0_-4px_16px_rgb(30_39_51/0.08)]">
      <p className="text-xl font-bold">
        Ma séance <span aria-hidden="true">·</span> {describeDraft(draft)}
      </p>
      <Button ref={ref} onClick={onOpen} className="min-h-13 px-7">
        Voir ma séance
      </Button>
    </div>
  )
})
