import { useMemo } from 'react'
import type { Job } from '../../api/types'
import { createJobIndex } from '../../lib/jobIndex'

const MAX_SUGGESTIONS = 3

interface JobSuggestionsProps {
  query: string
  jobs: readonly Job[]
  onJobSelect: (job: Job) => void
}

/**
 * La recherche texte ne porte que sur les titres : « garagiste » ne trouve aucune vidéo.
 * Si le texte ressemble à un métier, on propose de filtrer par ce métier, en gros boutons.
 */
export function JobSuggestions({ query, jobs, onJobSelect }: JobSuggestionsProps) {
  const matches = useMemo(() => createJobIndex(jobs)(query, MAX_SUGGESTIONS), [jobs, query])
  if (matches.length === 0) return null

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-action-subtle px-5 py-4">
      <p className="font-semibold">Vous cherchez un métier ?</p>
      <ul className="flex flex-wrap gap-3">
        {matches.map(({ job }) => (
          <li key={job.code}>
            <button
              type="button"
              onClick={() => onJobSelect(job)}
              className="min-h-11 rounded-lg border-2 border-action bg-surface px-4 text-left text-lg font-semibold text-action hover:bg-action-subtle"
            >
              Voir les vidéos : {job.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
