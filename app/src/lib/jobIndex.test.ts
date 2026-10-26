import { describe, expect, it } from 'vitest'
import type { Job } from '../api/types'
import { createJobIndex, normalizeText } from './jobIndex'

// Tests de la recherche de métiers : l'API ne cherche que dans les titres de vidéos, donc
// c'est cet index qui permet de taper « garagiste » et de trouver Mécanicien automobile.

// Fabrique un métier ; les domaines ne servent pas à la recherche, ils sont remplis au minimum.
function job(code: string, label: string, appellations: string[]): Job {
  return {
    code,
    label,
    major_domain: { code: code.charAt(0), label: '' },
    professional_domain: { code: code.slice(0, 3), label: '' },
    appellations,
  }
}

// Extraits réels de server/data/catalog.json.
const jobs = [
  job('I1604', 'Mécanicien / Mécanicienne automobile', [
    'Garagiste',
    'Garagiste-mécanicien / Garagiste-mécanicienne',
    'Mécanicien / Mécanicienne VL',
  ]),
  job('I1607', 'Mécanicien / Mécanicienne motocycles', ['Mécanicien / Mécanicienne motos']),
  job('D1102', 'Boulanger / Boulangère', ['Boulanger-pâtissier / Boulangère-pâtissière']),
  job('H2102', 'Conducteur / Conductrice de machines en industrie alimentaire', [
    'Conducteur / Conductrice de four en boulangerie industrielle',
  ]),
  job('D1202', 'Coiffeur / Coiffeuse', ['Coiffeur / Coiffeuse mixte']),
  job('N1101', 'Cariste', ['Agent / Agente logistique cariste']),
]

const search = createJobIndex(jobs)
// Raccourci : ne garde que les codes ROME trouvés, pour des assertions courtes.
const codes = (query: string) => search(query).map((m) => m.job.code)

describe('normalizeText', () => {
  it('retire accents, majuscules et ponctuation', () => {
    expect(normalizeText('  Mécanicien / Mécanicienne VL ')).toBe('mecanicien mecanicienne vl')
  })
})

describe('createJobIndex', () => {
  it('trouve un métier par une appellation (« garagiste »)', () => {
    expect(search('garagiste')).toEqual([{ job: jobs[0], matchedLabel: 'Garagiste' }])
  })

  it('est insensible à la casse et aux accents', () => {
    expect(codes('MECANICIEN')).toEqual(['I1604', 'I1607'])
    expect(codes('boulangère')).toEqual(['D1102', 'H2102'])
  })

  it('accepte un début de mot (« boulang »)', () => {
    expect(codes('boulang')).toEqual(['D1102', 'H2102'])
  })

  it('classe les correspondances sur le libellé avant celles sur les appellations', () => {
    expect(search('boulang').map((m) => m.matchedLabel)).toEqual([
      'Boulanger / Boulangère',
      'Conducteur / Conductrice de four en boulangerie industrielle',
    ])
  })

  it('rapproche les mots de la même famille (« coiffure », « logistique »)', () => {
    expect(codes('coiffure')).toEqual(['D1202'])
    expect(codes('logistique')).toEqual(['N1101'])
  })

  it('exige que chaque mot de la recherche corresponde', () => {
    expect(codes('mécanicien moto')).toEqual(['I1607'])
  })

  it('ne propose rien pour une recherche trop courte ou sans rapport', () => {
    expect(search('a')).toEqual([])
    expect(search('astronaute')).toEqual([])
  })

  it('respecte la limite de résultats', () => {
    expect(search('m', 1)).toEqual([])
    expect(search('mecanicien', 1)).toHaveLength(1)
  })
})
