import type { Audience, Headset, Job, Paginated, Video } from '../api/types'
import { jsonResponse } from './fetchMock'

// Petit catalogue fictif, au format exact de l'API, pour les tests d'interface.

export const jobs: Job[] = [
  {
    code: 'I1604',
    label: 'Mécanicien / Mécanicienne automobile',
    major_domain: { code: 'I', label: 'Installation et Maintenance' },
    professional_domain: { code: 'I16', label: 'Véhicules, engins, aéronefs' },
    appellations: ['Garagiste'],
  },
  {
    code: 'D1102',
    label: 'Boulanger / Boulangère',
    major_domain: { code: 'D', label: 'Commerce, vente et grande distribution' },
    professional_domain: { code: 'D11', label: 'Commerce alimentaire' },
    appellations: ['Mitron / Mitronne'],
  },
]

export const headsets: Headset[] = [
  { id: 'pico-4', name: 'Pico 4' },
  { id: 'meta-quest-3', name: 'Meta Quest 3' },
]

export const audiences: Audience[] = [
  { id: 'college', label: 'Collégien·nes' },
  { id: 'lycee', label: 'Lycéen·nes' },
]

export function makeVideo(index: number, overrides: Partial<Video> = {}): Video {
  return {
    id: `vid_${String(index).padStart(3, '0')}`,
    title: `Vidéo numéro ${index}`,
    description: '',
    duration_seconds: 455,
    jobs: ['I1604'],
    audiences: ['lycee'],
    compatible_headsets: ['pico-4'],
    thumbnail_url: null,
    published_at: '2024-01-01',
    ...overrides,
  }
}

/** Réponse paginée de `GET /videos` : `total` vidéos au total, page demandée dans l'URL. */
export function videosPage(url: URL, total: number): Paginated<Video> {
  const page = Number(url.searchParams.get('page') ?? 1)
  const perPage = Number(url.searchParams.get('per_page') ?? 24)
  const start = (page - 1) * perPage
  const count = Math.max(0, Math.min(perPage, total - start))
  return {
    data: Array.from({ length: count }, (_, i) => makeVideo(start + i + 1)),
    meta: { page, per_page: perPage, total, total_pages: Math.max(1, Math.ceil(total / perPage)) },
  }
}

/** Faux serveur : référentiels fixes ; `/videos` délégué au test pour simuler chaque cas. */
export function catalogApi(videos: (url: URL) => Response | Promise<Response>) {
  return (url: URL): Response | Promise<Response> => {
    switch (url.pathname) {
      case '/jobs':
        return jsonResponse({ data: jobs, source: 'ROME' })
      case '/headsets':
        return jsonResponse({ data: headsets })
      case '/audiences':
        return jsonResponse({ data: audiences })
      case '/videos':
        return videos(url)
      default:
        return jsonResponse({ error: 'not_found' }, 404)
    }
  }
}
