/** « 0 vidéo », « 1 vidéo », « 42 vidéos » : en français, 0 et 1 sont au singulier. */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count.toLocaleString('fr-FR')} ${count <= 1 ? singular : plural}`
}
