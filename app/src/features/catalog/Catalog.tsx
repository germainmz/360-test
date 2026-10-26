import { useRef } from 'react'
import { useVideos } from '../../api/queries'
import type { Job, Video } from '../../api/types'
import { Button } from '../../components/Button'
import { pluralize } from '../../lib/pluralize'
import { ActiveFilters, type ActiveFilter } from './ActiveFilters'
import { CatalogSearch } from './CatalogSearch'
import { FilterSelect } from './FilterSelect'
import { groupJobsByDomain } from './groupJobsByDomain'
import { JobSuggestions } from './JobSuggestions'
import { useCatalogFilters } from './useCatalogFilters'
import { useCatalogReferences } from './useCatalogReferences'
import { VideoList } from './VideoList'

interface CatalogProps {
  onAdd: (video: Video) => void
}

/** Recherche, filtres et résultats du catalogue (partie gauche de l'écran « Préparer une séance »). */
export function Catalog({ onAdd }: CatalogProps) {
  const { filters, update, clearAll, hasActiveFilters } = useCatalogFilters()
  const references = useCatalogReferences()
  const { jobs, headsets, audiences } = references
  const videos = useVideos(filters)
  const searchRef = useRef<HTMLInputElement>(null)

  const jobList = jobs.data ?? []
  const total = videos.data?.pages[0]?.meta.total

  function selectJob(job: Job) {
    update({ job: job.code, q: undefined })
  }

  function clearFilters() {
    clearAll()
    searchRef.current?.focus()
  }

  const activeFilters: ActiveFilter[] = []
  if (filters.audience) {
    const label = references.audiencesById.get(filters.audience)?.label ?? 'sélectionné'
    activeFilters.push({ name: 'audience', label: `Public : ${label}` })
  }
  if (filters.headset) {
    const name = references.headsetsById.get(filters.headset)?.name ?? 'sélectionné'
    activeFilters.push({ name: 'headset', label: `Casque : ${name}` })
  }
  if (filters.job) {
    const label = references.jobsByCode.get(filters.job)?.label ?? 'sélectionné'
    activeFilters.push({ name: 'job', label: `Métier : ${label}` })
  }

  let status = ''
  if (videos.isPending || videos.isPlaceholderData) status = 'Chargement des vidéos…'
  else if (total !== undefined) status = pluralize(total, 'vidéo')

  return (
    <section aria-labelledby="catalogue-titre" className="@container flex flex-col gap-5">
      <h2 id="catalogue-titre" className="sr-only">
        Catalogue des vidéos
      </h2>

      <CatalogSearch
        ref={searchRef}
        query={filters.q ?? ''}
        jobs={jobList}
        onQueryChange={(q) => update({ q })}
        onJobSelect={selectJob}
      />

      <div className="grid gap-5 @lg:grid-cols-2 @2xl:grid-cols-3">
        <FilterSelect
          id="filtre-public"
          label="Public"
          allLabel="Tous les publics"
          value={filters.audience ?? ''}
          onChange={(audience) => update({ audience })}
          status={audiences.status}
          onRetry={() => void audiences.refetch()}
        >
          {audiences.data?.map((audience) => (
            <option key={audience.id} value={audience.id}>
              {audience.label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          id="filtre-casque"
          label="Casque"
          allLabel="Tous les casques"
          value={filters.headset ?? ''}
          onChange={(headset) => update({ headset })}
          status={headsets.status}
          onRetry={() => void headsets.refetch()}
        >
          {headsets.data?.map((headset) => (
            <option key={headset.id} value={headset.id}>
              {headset.name}
            </option>
          ))}
        </FilterSelect>
        <div className="@lg:col-span-2 @2xl:col-span-1">
          <FilterSelect
            id="filtre-metier"
            label="Métier"
            allLabel="Tous les métiers"
            value={filters.job ?? ''}
            onChange={(job) => update({ job })}
            status={jobs.status}
            onRetry={() => void jobs.refetch()}
          >
            {groupJobsByDomain(jobList).map((group) => (
              <optgroup key={group.domain} label={group.domain}>
                {group.jobs.map((job) => (
                  <option key={job.code} value={job.code}>
                    {job.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </FilterSelect>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <ActiveFilters
          filters={activeFilters}
          onRemove={(name) => update({ [name]: undefined })}
          onEmpty={() => searchRef.current?.focus()}
        />
        {hasActiveFilters && (
          <Button variant="link" onClick={clearFilters}>
            Effacer les filtres
          </Button>
        )}
        <p role="status" className="ml-auto text-xl font-bold">
          {status}
        </p>
      </div>

      {filters.q && !filters.job && (
        <JobSuggestions query={filters.q} jobs={jobList} onJobSelect={selectJob} />
      )}

      <VideoList
        query={videos}
        references={references}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        onAdd={onAdd}
      />
    </section>
  )
}
