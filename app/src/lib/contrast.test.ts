// Vérifie que les couleurs de l'interface restent lisibles (WCAG 2.2 AA).
// Les couleurs sont lues directement dans index.css : si quelqu'un change un jeton
// et casse un contraste, ce test échoue. axe ne peut pas le faire sous jsdom.
import { describe, expect, it } from 'vitest'
import css from '../index.css?raw'
import { contrastRatio } from './contrast'

// Associe chaque nom de jeton (« ink », « action »…) à sa valeur hexadécimale.
const tokens = new Map(
  [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]),
)

function token(name: string): string {
  const value = tokens.get(name)
  if (!value) throw new Error(`Jeton --color-${name} absent de index.css`)
  return value
}

// Seuils WCAG AA : texte courant, puis bordures, anneau de focus et icônes.
const TEXT = 4.5
const NON_TEXT = 3

// Chaque couple réellement utilisé dans l'interface : [couleur du premier plan, fond, seuil].
// « surface » en premier plan = texte blanc sur un bouton coloré.
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
  // États ajoutés aux étapes 5 à 7 : boutons bloqués ou en cours, confirmation, séance affichée.
  ['ink', 'surface-muted', TEXT],
  ['ink', 'success-subtle', TEXT],
  ['ink', 'action-subtle', TEXT],
  ['ink-muted', 'action-subtle', TEXT],
  ['ink', 'warning-subtle', TEXT],
  ['border', 'surface-muted', NON_TEXT],
  ['danger', 'danger-subtle', NON_TEXT],
  ['focus', 'action-subtle', NON_TEXT],
  ['focus', 'success-subtle', NON_TEXT],
  ['focus', 'danger-subtle', NON_TEXT],
  ['focus', 'warning-subtle', NON_TEXT],
  ['action', 'success-subtle', NON_TEXT],
]

// D'abord le calcul lui-même, sur des valeurs connues, pour pouvoir lui faire confiance ensuite.
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
