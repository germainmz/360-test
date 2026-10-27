import { formatTotalDuration } from '../../lib/formatDuration'
import { pluralize } from '../../lib/pluralize'
import { totalDurationSeconds, type Draft } from './draftReducer'

/** Résumé court affiché et annoncé partout : « 4 vidéos · 33 min ». */
export function describeDraft(draft: Draft, separator = ' · '): string {
  return `${pluralize(draft.videos.length, 'vidéo')}${separator}${formatTotalDuration(totalDurationSeconds(draft))}`
}
