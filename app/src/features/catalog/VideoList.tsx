import { useEffect, useRef } from 'react'
import type { useVideos } from '../../api/queries'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { SlowLoadingMessage } from '../../components/SlowLoadingMessage'
import type { CatalogReferences } from './useCatalogReferences'
import { VideoCard } from './VideoCard'
import { VideoCardSkeleton } from './VideoCardSkeleton'

const SKELETON_COUNT = 6

const gridClass = 'grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-5'

interface VideoListProps {
  query: ReturnType<typeof useVideos>
  references: CatalogReferences
  hasActiveFilters: boolean
  onClearFilters: () => void
}

/**
 * Résultats du catalogue et tous leurs états : chargement (squelettes), chargement lent, erreur
 * avec « Réessayer », aucun résultat, résultats (gardés à l'écran pendant un changement de
 * filtre), et pagination par bouton.
 */
export function VideoList({ query, references, hasActiveFilters, onClearFilters }: VideoListProps) {
  const { data, isPending, isError, isFetching, isPlaceholderData, refetch } = query
  const { hasNextPage, fetchNextPage, isFetchingNextPage, isFetchNextPageError } = query

  const videos = data?.pages.flatMap((page) => page.data) ?? []
  const total = data?.pages[0]?.meta.total ?? 0

  const titleRefs = useRef(new Map<number, HTMLHeadingElement>())
  const firstNewIndex = useRef<number | null>(null)

  useEffect(() => {
    const index = firstNewIndex.current
    if (index === null || videos.length <= index) return
    firstNewIndex.current = null
    titleRefs.current.get(index)?.focus()
  }, [videos.length])

  function loadMore() {
    if (isFetchingNextPage) return
    firstNewIndex.current = videos.length
    void fetchNextPage()
  }

  const slowMessage = (
    <SlowLoadingMessage isLoading={isFetching}>
      Le catalogue met plus de temps que d’habitude à répondre…
    </SlowLoadingMessage>
  )

  if (isPending) {
    return (
      <div className="flex flex-col gap-5">
        {slowMessage}
        <ul aria-busy="true" aria-label="Chargement des vidéos" className={gridClass}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <li key={index}>
              <VideoCardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (isError && !data) {
    return (
      <ErrorState onRetry={() => void refetch()}>
        Le catalogue n’a pas pu être chargé. Vos filtres sont conservés.
      </ErrorState>
    )
  }

  if (total === 0) {
    return (
      <EmptyState
        title="Aucune vidéo ne correspond à votre recherche"
        action={
          hasActiveFilters && (
            <Button variant="secondary" onClick={onClearFilters}>
              Effacer les filtres
            </Button>
          )
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {slowMessage}
      <ul
        aria-label="Vidéos"
        aria-busy={isPlaceholderData}
        className={`${gridClass} transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}
      >
        {videos.map((video, index) => (
          <li key={video.id}>
            <VideoCard
              ref={(element) => {
                if (element) titleRefs.current.set(index, element)
                else titleRefs.current.delete(index)
              }}
              video={video}
              references={references}
            />
          </li>
        ))}
      </ul>

      {isFetchNextPageError && (
        <ErrorState onRetry={loadMore}>Les vidéos suivantes n’ont pas pu être chargées.</ErrorState>
      )}

      <div className="flex flex-col items-center gap-2 py-4">
        {hasNextPage && !isFetchNextPageError ? (
          // aria-disabled plutôt que disabled : le bouton garde le focus pendant le chargement.
          <Button
            variant="secondary"
            onClick={loadMore}
            aria-disabled={isFetchingNextPage}
            className="min-h-13 px-8"
          >
            {isFetchingNextPage
              ? 'Chargement…'
              : `Afficher plus de vidéos (${videos.length} sur ${total})`}
          </Button>
        ) : (
          !hasNextPage && <p className="text-ink-muted">Les {total} vidéos sont affichées.</p>
        )}
      </div>
    </div>
  )
}
