import { describe, expect, it } from 'vitest'
import { makeVideo } from '../../test/catalogFixtures'
import { emptyDraft, MAX_VIDEOS } from './draftReducer'
import { parseDraft } from './draftStorage'

// Le brouillon relu depuis localStorage ne doit jamais faire planter l'application.

describe('parseDraft', () => {
  it('relit un brouillon valide', () => {
    const draft = { name: 'Atelier', headsetId: 'pico-4', videos: [makeVideo(1)] }
    expect(parseDraft(JSON.stringify(draft))).toEqual(draft)
  })

  it.each([
    ['absent', null],
    ['JSON illisible', '{pas du json'],
    ['pas un objet', '[1, 2]'],
    ['null', 'null'],
  ])('renvoie un brouillon vide si le contenu est %s', (_, raw) => {
    expect(parseDraft(raw)).toEqual(emptyDraft)
  })

  it('écarte les vidéos invalides et les doublons, et garde les champs valides', () => {
    const raw = JSON.stringify({
      name: 42,
      headsetId: 'pico-4',
      videos: [makeVideo(1), { id: 'vid_x' }, makeVideo(1), makeVideo(2)],
    })
    expect(parseDraft(raw)).toEqual({
      name: '',
      headsetId: 'pico-4',
      videos: [makeVideo(1), makeVideo(2)],
    })
  })

  it(`tronque à ${MAX_VIDEOS} vidéos`, () => {
    const videos = Array.from({ length: MAX_VIDEOS + 5 }, (_, i) => makeVideo(i + 1))
    expect(parseDraft(JSON.stringify({ videos })).videos).toHaveLength(MAX_VIDEOS)
  })
})
