import { useMemo } from 'react'
import { useAudiences, useHeadsets, useJobs } from '../../api/queries'
import type { Audience, Headset, Job } from '../../api/types'

function byKey<T>(items: readonly T[] | undefined, key: (item: T) => string): Map<string, T> {
  return new Map((items ?? []).map((item) => [key(item), item]))
}

/**
 * Référentiels du catalogue et index pour retrouver un intitulé à partir d'un identifiant
 * (code ROME → libellé du métier, `lycee` → « Lycéen·nes »…).
 */
export function useCatalogReferences() {
  const jobs = useJobs()
  const headsets = useHeadsets()
  const audiences = useAudiences()

  const maps = useMemo(
    () => ({
      jobsByCode: byKey<Job>(jobs.data, (job) => job.code),
      headsetsById: byKey<Headset>(headsets.data, (headset) => headset.id),
      audiencesById: byKey<Audience>(audiences.data, (audience) => audience.id),
    }),
    [jobs.data, headsets.data, audiences.data],
  )

  return { jobs, headsets, audiences, ...maps }
}

export type CatalogReferences = ReturnType<typeof useCatalogReferences>
