import { describe, expect, it } from 'vitest'
import { formatDuration } from './formatDuration'

// Les durées de l'API sont en secondes ; l'interface les affiche comme sur les maquettes.
describe('formatDuration', () => {
  it.each([
    [455, '7 min 35 s'],
    [420, '7 min'],
    [45, '45 s'],
    [3600, '1 h'],
    [3725, '1 h 2 min 5 s'],
    [0, '0 s'],
  ])('%i s → « %s »', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected)
  })

  it('arrondit les secondes et ignore les valeurs négatives', () => {
    expect(formatDuration(59.6)).toBe('1 min')
    expect(formatDuration(-5)).toBe('0 s')
  })
})
