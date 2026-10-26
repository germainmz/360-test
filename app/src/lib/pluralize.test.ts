import { describe, expect, it } from 'vitest'
import { pluralize } from './pluralize'

describe('pluralize', () => {
  it('met 0 et 1 au singulier, comme en français', () => {
    expect(pluralize(0, 'vidéo')).toBe('0 vidéo')
    expect(pluralize(1, 'vidéo')).toBe('1 vidéo')
    expect(pluralize(42, 'vidéo')).toBe('42 vidéos')
  })
})
