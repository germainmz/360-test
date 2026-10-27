import { useDelayedFlag } from '../hooks/useDelayedFlag'

/** Au-delà, l'API simulée est « lente » : on rassure plutôt que de laisser croire à une panne. */
export const SLOW_LOADING_MS = 2000

interface SlowLoadingMessageProps {
  isLoading: boolean
  /** Ex. « Le catalogue met plus de temps que d'habitude à répondre… » */
  children: string
}

/** Message discret (`role="status"`) affiché seulement si le chargement dure plus de 2 s. */
export function SlowLoadingMessage({ isLoading, children }: SlowLoadingMessageProps) {
  const isSlow = useDelayedFlag(isLoading, SLOW_LOADING_MS)
  if (!isSlow) return null
  return (
    <p
      role="status"
      className="flex items-center gap-3 rounded-xl border-2 border-border-subtle bg-surface px-5 py-3"
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-[3px] border-border-subtle border-t-action"
      />
      {children}
    </p>
  )
}
