const longDate = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/**
 * Date en toutes lettres, à l'heure locale : « 22 octobre 2026 ». Plus facile à retrouver devant
 * un groupe qu'un « 22/10/2026 ». Renvoie `null` si la date est illisible.
 */
export function formatLongDate(iso: string): string | null {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : longDate.format(date)
}
