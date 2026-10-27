import { describe, expect, it } from 'vitest'
import { makeVideo } from '../../test/catalogFixtures'
import { emptyDraft, MAX_VIDEOS, type Draft } from './draftReducer'
import { NAME_MAX_LENGTH, validateDraft } from './validateDraft'

// Mêmes règles que l'API (server/server.mjs), vérifiées avant l'envoi.

const draft = (overrides: Partial<Draft>): Draft => ({
  ...emptyDraft,
  name: 'Atelier',
  videos: [makeVideo(1)],
  ...overrides,
})

describe('validateDraft', () => {
  it('accepte une séance nommée avec au moins une vidéo', () => {
    expect(validateDraft(draft({}))).toEqual({})
  })

  it.each(['', '   '])('refuse un nom vide après suppression des espaces (%j)', (name) => {
    expect(validateDraft(draft({ name }))).toEqual({ name: 'Le nom est obligatoire.' })
  })

  it(`compte la longueur du nom sans les espaces autour (${NAME_MAX_LENGTH} au plus)`, () => {
    const longest = 'a'.repeat(NAME_MAX_LENGTH)
    expect(validateDraft(draft({ name: `  ${longest}  ` }))).toEqual({})
    expect(validateDraft(draft({ name: `${longest}a` })).name).toMatch(/120 caractères/)
  })

  it(`exige de 1 à ${MAX_VIDEOS} vidéos`, () => {
    expect(validateDraft(draft({ videos: [] })).video_ids).toMatch(/au moins une vidéo/)
    const tooMany = Array.from({ length: MAX_VIDEOS + 1 }, (_, i) => makeVideo(i + 1))
    expect(validateDraft(draft({ videos: tooMany })).video_ids).toMatch(/au plus 30 vidéos/)
  })

  it('signale toutes les erreurs à la fois', () => {
    expect(Object.keys(validateDraft(draft({ name: '', videos: [] })))).toEqual([
      'name',
      'video_ids',
    ])
  })
})
