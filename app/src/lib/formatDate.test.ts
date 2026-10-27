import { describe, expect, it } from 'vitest'
import { formatLongDate } from './formatDate'

describe('formatLongDate', () => {
  // Midi UTC : la même date dans tous les fuseaux d'Europe et d'outre-mer proches.
  it('écrit la date en toutes lettres, en français', () => {
    expect(formatLongDate('2026-10-22T12:00:00Z')).toBe('22 octobre 2026')
    expect(formatLongDate('2026-03-01T12:00:00Z')).toBe('1 mars 2026')
  })

  it('renvoie null pour une date illisible', () => {
    expect(formatLongDate('pas une date')).toBeNull()
  })
})
