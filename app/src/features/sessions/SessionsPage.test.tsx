import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import type { Session, SessionInput } from '../../api/types'
import { catalogApi, makeVideo, videosPage } from '../../test/catalogFixtures'
import { jsonResponse, mockFetch } from '../../test/fetchMock'
import { createTestQueryClient, renderApp } from '../../test/renderApp'
import { DRAFT_STORAGE_KEY } from '../session/draftStorage'

// « Mes séances » : liste, détail, et « Repartir de cette séance ».

afterEach(() => {
  vi.unstubAllGlobals()
})

function makeSession(n: number, videoNumbers: number[], overrides: Partial<Session> = {}): Session {
  return {
    id: `ses_00${n}`,
    name: `Séance ${n}`,
    video_ids: videoNumbers.map((v) => makeVideo(v).id),
    headset_id: null,
    created_at: `2026-10-2${n}T12:00:00Z`,
    total_duration_seconds: videoNumbers.length * 455,
    ...overrides,
  }
}

/**
 * Faux serveur avec des séances en mémoire, comme l'API simulée : la plus récente en tête de
 * `GET /sessions`, `POST /sessions` en ajoute une. `/videos/{id}` répond pour vid_001 à vid_099.
 */
function renderSessions(
  path: string,
  initial: Session[] = [],
  options: { failList?: number } = {},
) {
  const sessions = [...initial]
  let listFailures = options.failList ?? 0
  const readCatalog = catalogApi((url) => jsonResponse(videosPage(url, 6)))
  const fetchMock = mockFetch((url, init) => {
    const { pathname } = url
    if (pathname === '/sessions' && init.method === 'POST') {
      const input: SessionInput = JSON.parse(String(init.body))
      const session = makeSession(sessions.length + 1, [], {
        name: input.name,
        video_ids: input.video_ids,
        headset_id: input.headset_id ?? null,
        created_at: '2026-10-27T12:00:00Z',
        total_duration_seconds: input.video_ids.length * 455,
      })
      sessions.unshift(session)
      return jsonResponse(session, 201)
    }
    if (pathname === '/sessions') {
      if (listFailures-- > 0) return jsonResponse({ error: 'internal_error' }, 500)
      return jsonResponse({ data: sessions })
    }
    const sessionId = pathname.match(/^\/sessions\/(.+)$/)?.[1]
    if (sessionId) {
      const session = sessions.find((item) => item.id === sessionId)
      return session ? jsonResponse(session) : jsonResponse({ error: 'not_found' }, 404)
    }
    const videoNumber = Number(pathname.match(/^\/videos\/vid_(\d+)$/)?.[1])
    if (videoNumber) {
      return videoNumber < 100
        ? jsonResponse(makeVideo(videoNumber))
        : jsonResponse({ error: 'not_found' }, 404)
    }
    return readCatalog(url)
  })
  return { ...renderApp(path, createTestQueryClient()), fetchMock }
}

const sessionList = () => screen.getByRole('list', { name: 'Séances enregistrées' })
const storedDraft = () => JSON.parse(window.localStorage.getItem(DRAFT_STORAGE_KEY) ?? 'null')

describe('Liste des séances', () => {
  it('affiche chaque séance avec sa date en toutes lettres, ses vidéos et sa durée', async () => {
    renderSessions('/seances', [makeSession(2, [1, 2, 3]), makeSession(1, [4])])

    await screen.findByRole('list', { name: 'Séances enregistrées' })
    const [first, second] = within(sessionList()).getAllByRole('listitem')
    expect(first).toHaveTextContent('Séance 2')
    expect(first).toHaveTextContent('22 octobre 2026 · 3 vidéos · 23 min')
    expect(second).toHaveTextContent('21 octobre 2026 · 1 vidéo · 8 min')
    expect(screen.getByText('2 séances')).toBeVisible()
  })

  it('sans séance, propose d’en préparer une', async () => {
    renderSessions('/seances')
    expect(await screen.findByText('Vous n’avez pas encore enregistré de séance')).toBeVisible()
    expect((await axe(document.body)).violations).toEqual([])
    // Le lien de l'état vide, pas celui de la navigation principale.
    expect(
      within(screen.getByRole('main')).getByRole('link', { name: 'Préparer une séance' }),
    ).toHaveAttribute('href', '/')
  })

  it('en cas d’erreur, propose « Réessayer » qui recharge la liste', async () => {
    const user = userEvent.setup()
    renderSessions('/seances', [makeSession(1, [1])], { failList: 1 })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Vos séances n’ont pas pu être chargées.',
    )
    await user.click(screen.getByRole('button', { name: 'Réessayer' }))
    expect(await screen.findByRole('link', { name: 'Séance 1' })).toBeVisible()
  })
})

describe('Détail d’une séance', () => {
  it('« Voir » affiche les vidéos dans l’ordre et place le focus sur le nom de la séance', async () => {
    const user = userEvent.setup()
    renderSessions('/seances', [makeSession(1, [3, 1, 2])])

    await user.click(await screen.findByRole('link', { name: 'Séance 1' }))

    const heading = await screen.findByRole('heading', { level: 2, name: 'Séance 1' })
    await waitFor(() => expect(heading).toHaveFocus())
    expect(screen.getByRole('link', { name: 'Séance 1' })).toHaveAttribute('aria-current', 'page')
    const videos = screen.getByRole('list', { name: /Vidéos de la séance/ })
    await waitFor(() =>
      expect(
        within(videos)
          .getAllByRole('listitem')
          .map((item) => item.querySelector('p')?.textContent),
      ).toEqual(['1. Vidéo numéro 3', '2. Vidéo numéro 1', '3. Vidéo numéro 2']),
    )
    expect(document.title).toBe('Séance 1 · Mes séances · Métiers 360')
  })

  it('explique qu’une séance est introuvable (404) et ramène à la liste', async () => {
    renderSessions('/seances/ses_999', [makeSession(1, [1])])
    expect(await screen.findByRole('heading', { name: 'Séance introuvable' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Voir toutes mes séances' })).toHaveAttribute(
      'href',
      '/seances',
    )
  })

  it('en tablette portrait, affiche le détail seul avec un lien retour', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    renderSessions('/seances/ses_001', [makeSession(1, [1])])

    expect(await screen.findByRole('heading', { level: 2, name: 'Séance 1' })).toBeVisible()
    expect(screen.queryByRole('list', { name: 'Séances enregistrées' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Toutes mes séances' })).toHaveAttribute(
      'href',
      '/seances',
    )
  })

  it('ne présente aucune violation axe', async () => {
    const { container } = renderSessions('/seances/ses_001', [makeSession(1, [1, 2])])
    await screen.findByText('Vidéo numéro 2')
    expect((await axe(container)).violations).toEqual([])
  })
})

describe('Repartir de cette séance', () => {
  it('copie la séance dans un brouillon vide et ouvre « Préparer une séance »', async () => {
    const user = userEvent.setup()
    const { router } = renderSessions('/seances/ses_001', [
      makeSession(1, [3, 1], { headset_id: 'pico-4' }),
    ])
    await screen.findByText('Vidéo numéro 1')

    await user.click(screen.getByRole('button', { name: 'Repartir de cette séance' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    const heading = await screen.findByRole('heading', { level: 1, name: 'Préparer une séance' })
    await waitFor(() => expect(heading).toHaveFocus())
    expect(storedDraft()).toMatchObject({
      name: 'Séance 1',
      headsetId: 'pico-4',
      savedSessionId: null,
    })
    expect(storedDraft().videos.map((video: { id: string }) => video.id)).toEqual([
      'vid_003',
      'vid_001',
    ])
    await waitFor(() =>
      expect(screen.getByTestId('annonces')).toHaveTextContent(
        'Copie de « Séance 1 » prête dans « Préparer une séance ».',
      ),
    )
  })

  it('demande avant de remplacer une séance en préparation non enregistrée', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ name: 'Mon atelier', headsetId: null, videos: [makeVideo(5)] }),
    )
    const { router } = renderSessions('/seances/ses_001', [makeSession(1, [1])])
    await screen.findByText('Vidéo numéro 1')
    const restart = screen.getByRole('button', { name: 'Repartir de cette séance' })

    await user.click(restart)
    const dialog = await screen.findByRole('alertdialog', {
      name: 'Remplacer la séance en préparation ?',
    })
    expect(dialog).toHaveTextContent('« Mon atelier » (1 vidéo · 8 min)')
    const keep = within(dialog).getByRole('button', { name: 'Garder ma séance en cours' })
    await waitFor(() => expect(keep).toHaveFocus())
    expect((await axe(document.body)).violations).toEqual([])

    await user.click(keep)
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(storedDraft()).toMatchObject({ name: 'Mon atelier' })
    expect(router.state.location.pathname).toBe('/seances/ses_001')

    await user.click(restart)
    await user.click(await screen.findByRole('button', { name: 'Remplacer' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(storedDraft()).toMatchObject({ name: 'Séance 1' })
  })

  it('ne copie pas une vidéo qui n’est plus au catalogue, et le signale', async () => {
    const user = userEvent.setup()
    renderSessions('/seances/ses_001', [makeSession(1, [1, 150, 2])])

    expect(await screen.findByText('Cette vidéo n’est plus au catalogue.')).toBeVisible()
    const restart = await screen.findByRole('button', {
      name: 'Repartir de cette séance',
      description: /Une vidéo n’est plus au catalogue : elle ne sera pas copiée\./,
    })
    await user.click(restart)
    await waitFor(() =>
      expect(storedDraft().videos.map((video: { id: string }) => video.id)).toEqual([
        'vid_001',
        'vid_002',
      ]),
    )
  })
})

describe('Critère d’acceptation', () => {
  it('une séance qui vient d’être enregistrée apparaît en tête de liste', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ name: 'Atelier du jour', headsetId: null, videos: [makeVideo(1)] }),
    )
    renderSessions('/seances', [makeSession(1, [2])])
    await screen.findByRole('link', { name: 'Séance 1' })

    await user.click(screen.getByRole('link', { name: 'Préparer une séance' }))
    const panel = within(await screen.findByRole('complementary', { name: 'Ma séance' }))
    await user.click(panel.getByRole('button', { name: 'Enregistrer la séance' }))
    await user.click(await panel.findByRole('link', { name: 'Voir mes séances' }))

    await waitFor(() =>
      expect(
        within(sessionList())
          .getAllByRole('link')
          .map((link) => link.textContent),
      ).toEqual(['Atelier du jour', 'Séance 1']),
    )
  })
})
