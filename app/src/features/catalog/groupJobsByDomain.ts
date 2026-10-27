import type { Job } from '../../api/types'

export interface JobGroup {
  domain: string
  jobs: Job[]
}

/** Regroupe les métiers par grand domaine ROME, domaines et métiers triés par ordre alphabétique. */
export function groupJobsByDomain(jobs: readonly Job[]): JobGroup[] {
  const groups = new Map<string, Job[]>()
  for (const job of jobs) {
    const list = groups.get(job.major_domain.label) ?? []
    list.push(job)
    groups.set(job.major_domain.label, list)
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'fr'))
    .map(([domain, list]) => ({
      domain,
      jobs: list.sort((a, b) => a.label.localeCompare(b.label, 'fr')),
    }))
}
