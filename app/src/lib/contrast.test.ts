import { describe, expect, it } from 'vitest'
import css from '../index.css?raw'
import { contrastRatio } from './contrast'

const tokens = new Map(
  [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]),
)

function token(name: string): string {
  const value = tokens.get(name)
  if (!value) throw new Error(`Jeton --color-${name} absent de index.css`)
  return value
}

const TEXT = 4.5
const NON_TEXT = 3

const pairs: [foreground: string, background: string, minimum: number][] = [
  ['ink', 'paper', TEXT],
  ['ink', 'surface', TEXT],
  ['ink-muted', 'paper', TEXT],
  ['ink-muted', 'surface', TEXT],
  ['ink-muted', 'surface-muted', TEXT],
  ['action', 'paper', TEXT],
  ['action', 'surface', TEXT],
  ['action', 'action-subtle', TEXT],
  ['action-hover', 'surface', TEXT],
  ['accent', 'surface', TEXT],
  ['accent', 'warning-subtle', TEXT],
  ['success', 'surface', TEXT],
  ['success', 'success-subtle', TEXT],
  ['danger', 'surface', TEXT],
  ['danger', 'danger-subtle', TEXT],
  ['surface', 'action', TEXT],
  ['surface', 'action-hover', TEXT],
  ['surface', 'accent', TEXT],
  ['surface', 'success', TEXT],
  ['surface', 'danger', TEXT],
  ['border', 'paper', NON_TEXT],
  ['border', 'surface', NON_TEXT],
  ['focus', 'paper', NON_TEXT],
  ['focus', 'surface', NON_TEXT],
]

describe('contrastRatio', () => {
  it('donne 21:1 entre le noir et le blanc', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
  })

  it('est symétrique', () => {
    expect(contrastRatio('#1f4e8c', '#faf7f2')).toBeCloseTo(contrastRatio('#faf7f2', '#1f4e8c'))
  })
})

describe('jetons de couleur (WCAG AA)', () => {
  it.each(pairs)('%s sur %s ≥ %s:1', (foreground, background, minimum) => {
    expect(contrastRatio(token(foreground), token(background))).toBeGreaterThanOrEqual(minimum)
  })
})
