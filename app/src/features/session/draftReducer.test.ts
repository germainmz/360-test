import { describe, expect, it } from 'vitest'
import { makeVideo } from '../../test/catalogFixtures'
import {
  draftReducer,
  emptyDraft,
  isIncompatible,
  MAX_VIDEOS,
  totalDurationSeconds,
  type Draft,
  type DraftAction,
} from './draftReducer'

// Règles du brouillon de séance, testées sans interface : c'est la logique métier pure.

const [a, b, c] = [makeVideo(1), makeVideo(2), makeVideo(3)]
const draftWith = (...videos: ReturnType<typeof makeVideo>[]): Draft => ({ ...emptyDraft, videos })
const ids = (draft: Draft) => draft.videos.map((video) => video.id)

describe('draftReducer', () => {
  it('ajoute une vidéo à la fin', () => {
    expect(ids(draftReducer(draftWith(a), { type: 'add', video: b }))).toEqual([
      'vid_001',
      'vid_002',
    ])
  })

  it('refuse un doublon et renvoie le même brouillon', () => {
    const draft = draftWith(a)
    expect(draftReducer(draft, { type: 'add', video: a })).toBe(draft)
  })

  it(`refuse une ${MAX_VIDEOS + 1}e vidéo`, () => {
    const full = draftWith(...Array.from({ length: MAX_VIDEOS }, (_, i) => makeVideo(i + 1)))
    expect(draftReducer(full, { type: 'add', video: makeVideo(99) })).toBe(full)
  })

  it('retire une vidéo', () => {
    expect(ids(draftReducer(draftWith(a, b, c), { type: 'remove', videoId: 'vid_002' }))).toEqual([
      'vid_001',
      'vid_003',
    ])
  })

  it('monte et descend une vidéo d’un cran', () => {
    const draft = draftWith(a, b, c)
    expect(ids(draftReducer(draft, { type: 'moveUp', videoId: 'vid_003' }))).toEqual([
      'vid_001',
      'vid_003',
      'vid_002',
    ])
    expect(ids(draftReducer(draft, { type: 'moveDown', videoId: 'vid_001' }))).toEqual([
      'vid_002',
      'vid_001',
      'vid_003',
    ])
  })

  it('ne bouge pas la première vers le haut ni la dernière vers le bas', () => {
    const draft = draftWith(a, b)
    expect(draftReducer(draft, { type: 'moveUp', videoId: 'vid_001' })).toBe(draft)
    expect(draftReducer(draft, { type: 'moveDown', videoId: 'vid_002' })).toBe(draft)
  })

  it('déplace à une position donnée, bornée à la liste', () => {
    const draft = draftWith(a, b, c)
    expect(ids(draftReducer(draft, { type: 'moveTo', videoId: 'vid_003', index: 0 }))).toEqual([
      'vid_003',
      'vid_001',
      'vid_002',
    ])
    expect(ids(draftReducer(draft, { type: 'moveTo', videoId: 'vid_001', index: 99 }))).toEqual([
      'vid_002',
      'vid_003',
      'vid_001',
    ])
  })

  it('ignore une action sur une vidéo absente', () => {
    const draft = draftWith(a)
    expect(draftReducer(draft, { type: 'remove', videoId: 'vid_999' })).toBe(draft)
    expect(draftReducer(draft, { type: 'moveTo', videoId: 'vid_999', index: 0 })).toBe(draft)
  })

  it('renomme, choisit le casque et remet à zéro', () => {
    let draft = draftReducer(draftWith(a), { type: 'rename', name: 'Atelier 2nde C' })
    draft = draftReducer(draft, { type: 'setHeadset', headsetId: 'pico-4' })
    expect(draft).toMatchObject({ name: 'Atelier 2nde C', headsetId: 'pico-4' })
    expect(draftReducer(draft, { type: 'reset' })).toEqual(emptyDraft)
  })

  it('bloque toute modification une fois la séance enregistrée, sauf la remise à zéro', () => {
    const saved = draftReducer(draftWith(a, b), { type: 'saved', sessionId: 'ses_004' })
    expect(saved.savedSessionId).toBe('ses_004')
    for (const action of [
      { type: 'add', video: c },
      { type: 'remove', videoId: 'vid_001' },
      { type: 'moveUp', videoId: 'vid_002' },
      { type: 'rename', name: 'Autre nom' },
      { type: 'setHeadset', headsetId: 'pico-4' },
      { type: 'saved', sessionId: 'ses_005' },
    ] satisfies DraftAction[]) {
      expect(draftReducer(saved, action)).toBe(saved)
    }
    expect(draftReducer(saved, { type: 'reset' })).toEqual(emptyDraft)
  })
})

describe('totalDurationSeconds et isIncompatible', () => {
  it('additionne les durées', () => {
    expect(totalDurationSeconds(draftWith(a, b))).toBe(910)
  })

  it('signale une vidéo incompatible seulement si un casque est choisi', () => {
    expect(isIncompatible(a, null)).toBe(false)
    expect(isIncompatible(a, 'pico-4')).toBe(false)
    expect(isIncompatible(a, 'meta-quest-3')).toBe(true)
  })
})
