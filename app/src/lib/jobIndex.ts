import type { Job } from '../api/types'

export interface JobMatch {
  job: Job
  /** Intitulé qui a correspondu : le libellé du métier ou une appellation (« Garagiste »). */
  matchedLabel: string
}

const MIN_QUERY_LENGTH = 2
/** Racine commune minimale pour rapprocher des mots de la même famille (coiffure → coiffeur). */
const MIN_STEM_LENGTH = 5
const MAX_SUFFIX_DIFFERENCE = 3

/** Minuscules, sans accents ni ponctuation : « Mécanicien / Mécanicienne » → « mecanicien mecanicienne ». */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function commonPrefixLength(a: string, b: string): number {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return i
}

function tokenMatchesWord(token: string, word: string): boolean {
  if (word.startsWith(token)) return true
  if (token.length < MIN_STEM_LENGTH) return false
  const stem = Math.max(MIN_STEM_LENGTH, token.length - MAX_SUFFIX_DIFFERENCE)
  return commonPrefixLength(token, word) >= stem
}

function matches(tokens: string[], words: string[]): boolean {
  return tokens.every((token) => words.some((word) => tokenMatchesWord(token, word)))
}

interface IndexedLabel {
  text: string
  words: string[]
}

interface IndexedJob {
  job: Job
  label: IndexedLabel
  appellations: IndexedLabel[]
}

function indexLabel(text: string): IndexedLabel {
  return { text, words: normalizeText(text).split(' ') }
}

/**
 * Associe un texte libre (« garagiste », « boulang », « coiffure ») aux métiers ROME, via leur
 * libellé et leurs appellations. Les correspondances sur le libellé passent en premier.
 */
export function createJobIndex(jobs: readonly Job[]) {
  const indexed: IndexedJob[] = jobs.map((job) => ({
    job,
    label: indexLabel(job.label),
    appellations: job.appellations.map(indexLabel),
  }))

  return function searchJobs(query: string, limit = 5): JobMatch[] {
    const normalized = normalizeText(query)
    if (normalized.length < MIN_QUERY_LENGTH) return []
    const tokens = normalized.split(' ')

    const byLabel: JobMatch[] = []
    const byAppellation: JobMatch[] = []
    for (const { job, label, appellations } of indexed) {
      if (matches(tokens, label.words)) {
        byLabel.push({ job, matchedLabel: job.label })
        continue
      }
      const appellation = appellations.find(({ words }) => matches(tokens, words))
      if (appellation) byAppellation.push({ job, matchedLabel: appellation.text })
    }

    const byJobLabel = (a: JobMatch, b: JobMatch) => a.job.label.localeCompare(b.job.label, 'fr')
    return [...byLabel.sort(byJobLabel), ...byAppellation.sort(byJobLabel)].slice(0, limit)
  }
}
