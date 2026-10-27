import type { ReactNode } from 'react'
import { Button } from './Button'

interface ErrorStateProps {
  children: ReactNode
  onRetry: () => void
  retryLabel?: string
}

/**
 * Erreur bloquante : message en français simple + « Réessayer ». `role="alert"` la fait lire
 * immédiatement par les lecteurs d'écran. Ne vide jamais la saisie de l'utilisateur·ice.
 */
export function ErrorState({ children, onRetry, retryLabel = 'Réessayer' }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-4 rounded-xl border-2 border-danger bg-danger-subtle px-5 py-4"
    >
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-danger font-bold text-surface"
      >
        !
      </span>
      <p className="min-w-0 flex-1 font-semibold text-danger">{children}</p>
      <Button onClick={onRetry}>{retryLabel}</Button>
    </div>
  )
}
