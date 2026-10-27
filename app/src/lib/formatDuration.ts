/**
 * Durée lisible en français, à partir de secondes : 455 → « 7 min 35 s », 420 → « 7 min »,
 * 3725 → « 1 h 2 min 5 s ». Les unités nulles sont omises pour rester court.
 */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds))
  if (seconds === 0) return '0 s'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = seconds % 60
  return [hours && `${hours} h`, minutes && `${minutes} min`, rest && `${rest} s`]
    .filter(Boolean)
    .join(' ')
}
