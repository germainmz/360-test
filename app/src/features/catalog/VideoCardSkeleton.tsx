/** Carte fantôme affichée pendant le premier chargement, à la place exacte des vraies cartes. */
export function VideoCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full flex-col overflow-hidden rounded-xl border-2 border-border-subtle bg-surface"
    >
      <div className="aspect-video animate-pulse bg-surface-muted" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-6 w-4/5 animate-pulse rounded bg-surface-muted" />
        <div className="h-5 w-3/5 animate-pulse rounded bg-surface-muted" />
        <div className="h-5 w-2/5 animate-pulse rounded bg-surface-muted" />
        <div className="mt-3 h-12 animate-pulse rounded-lg bg-surface-muted" />
      </div>
    </div>
  )
}
