import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  /** Action pour s'en sortir (ex. « Effacer les filtres ») : un état vide n'est jamais une impasse. */
  action?: ReactNode
}

export function EmptyState({ title, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-xl bg-surface px-6 py-12 text-center">
      <span aria-hidden="true" className="relative block size-12">
        <span className="absolute inset-0 size-9 rounded-full border-4 border-ink-muted" />
        <span className="absolute right-0 bottom-0 h-1 w-4 origin-right rotate-45 rounded bg-ink-muted" />
      </span>
      <p className="text-xl font-semibold">{title}</p>
      {action}
    </div>
  )
}
