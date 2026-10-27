import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import type { Session, SessionInput } from '../../api/types'
import { catalogApi, makeVideo, videosPage } from '../../test/catalogFixtures'
import { jsonResponse, mockFetch } from '../../test/fetchMock'
import { createTestQueryClient, renderApp } from '../../test/renderApp'
import { DRAFT_STORAGE_KEY } from './draftStorage'

// Enregistrement de la séance (POST /sessions), avec une API qui échoue parfois (25 % en vrai).

afterEach(() => {
  vi.unstubAllGlobals()
})

const serverError = () => jsonResponse({ error: 'internal_error' }, 500)
const created = (input: SessionInput): Session => ({
  id: 'ses_004',
  name: input.name,
  video_ids: input.video_ids,
  headset_id: input.headset_id ?? null,
  created_at: '2026-10-27T09:00:00Z',
  total_duration_seconds: input.video_ids.length * 455,
})

/**
 * Faux serveur : catalogue normal, et les réponses de POST /sessions dans l'ordre donné
 * (la dernière est répétée). Les corps envoyés sont gardés pour les vérifier.
 */
function renderWithSaveResponses(
  ...responses: ((input: SessionInput) => Response | Promise<Response>)[]
) {
  const sent: SessionInput[] = []
  const readCatalog = catalogApi((url) => jsonResponse(videosPage(url, 6)))
  mockFetch((url, init) => {
    if (url.pathname === '/sessions' && init.method === 'POST') {
      const input: SessionInput = JSON.parse(String(init.body))
      sent.push(input)
      const respond = responses[sent.length - 1] ?? responses.at(-1)
      if (!respond) throw new Error('Aucune réponse prévue pour POST /sessions')
      return respond(input)
    }
    return readCatalog(url)
  })
  const view = renderApp('/', createTestQueryClient())
  return { ...view, sent }
}

function storeDraft(name: string, videoNumbers: number[], headsetId: string | null = null) {
  window.localStorage.setItem(
    DRAFT_STORAGE_KEY,
    JSON.stringify({ name, headsetId, videos: videoNumbers.map((n) => makeVideo(n)) }),
  )
}

const storedDraft = () => JSON.parse(window.localStorage.getItem(DRAFT_STORAGE_KEY) ?? 'null')
const panel = () => within(screen.getByRole('complementary', { name: 'Ma séance' }))
const nameField = () => panel().getByRole('textbox', { name: /Nom de la séance/ })
const saveButton = () => panel().getByRole('button', { name: 'Enregistrer la séance' })

describe('Enregistrer la séance', () => {
  it('envoie le nom sans espaces autour, les vidéos dans l’ordre et le casque, puis confirme', async () => {
    const user = userEvent.setup()
    storeDraft('  Atelier 3e B  ', [3, 1, 2], 'pico-4')
    const { sent } = renderWithSaveResponses((input) => jsonResponse(created(input), 201))

    await user.click(saveButton())

    const title = await panel().findByRole('heading', {
      name: 'Séance « Atelier 3e B » enregistrée',
    })
    expect(title).toHaveFocus()
    expect(panel().getByRole('status')).toHaveTextContent('3 vidéos · 23 min')
    expect(sent).toEqual([
      { name: 'Atelier 3e B', video_ids: ['vid_003', 'vid_001', 'vid_002'], headset_id: 'pico-4' },
    ])
    expect(panel().getByRole('link', { name: 'Voir mes séances' })).toHaveAttribute(
      'href',
      '/seances',
    )
    // Le brouillon n'est pas encore vidé, mais il est figé (le catalogue ne peut plus le modifier).
    expect(storedDraft()).toMatchObject({ savedSessionId: 'ses_004', name: '  Atelier 3e B  ' })
    const card = await screen.findByRole('button', {
      name: 'Retirer de la séance : Vidéo numéro 1',
    })
    expect(card).toHaveAttribute('aria-disabled', 'true')
    expect(card).toHaveAccessibleDescription(/préparez une nouvelle séance/)
  })

  it('« Préparer une nouvelle séance » vide le brouillon et place le focus sur le nom', async () => {
    const user = userEvent.setup()
    storeDraft('Atelier', [1])
    renderWithSaveResponses((input) => jsonResponse(created(input), 201))

    await user.click(saveButton())
    await user.click(await panel().findByRole('button', { name: 'Préparer une nouvelle séance' }))

    expect(nameField()).toHaveFocus()
    expect(nameField()).toHaveValue('')
    expect(panel().getByText('Ajoutez des vidéos depuis le catalogue')).toBeVisible()
    expect(storedDraft()).toEqual({ name: '', headsetId: null, videos: [], savedSessionId: null })
  })

  it('réessaie une fois tout seul après une erreur serveur, sans action de la personne', async () => {
    const user = userEvent.setup()
    storeDraft('Atelier', [1, 2])
    const { sent } = renderWithSaveResponses(serverError, (input) =>
      jsonResponse(created(input), 201),
    )

    await user.click(saveButton())

    expect(
      await panel().findByRole('heading', { name: 'Séance « Atelier » enregistrée' }),
    ).toBeVisible()
    expect(sent).toHaveLength(2)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('après deux échecs, garde la séance et propose « Réessayer »', async () => {
    const user = userEvent.setup()
    storeDraft('Atelier', [1, 2])
    const { sent } = renderWithSaveResponses(serverError, serverError, (input) =>
      jsonResponse(created(input), 201),
    )

    await user.click(saveButton())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'L’enregistrement a échoué. Votre séance est conservée.',
    )
    expect(sent).toHaveLength(2)
    expect(panel().getAllByRole('listitem')).toHaveLength(2)
    expect(nameField()).toHaveValue('Atelier')
    expect(storedDraft()).toMatchObject({ name: 'Atelier', savedSessionId: null })

    // Le même bouton, toujours focalisé, devient « Réessayer ».
    const retry = panel().getByRole('button', { name: 'Réessayer' })
    expect(retry).toHaveFocus()
    expect(retry).toHaveAccessibleDescription(/Votre séance est conservée/)
    await user.click(retry)
    expect(
      await panel().findByRole('heading', { name: 'Séance « Atelier » enregistrée' }),
    ).toBeVisible()
    expect(sent).toHaveLength(3)
  })

  it('pendant l’envoi, fige le brouillon et n’envoie la séance qu’une fois', async () => {
    const user = userEvent.setup()
    storeDraft('Atelier', [1, 2])
    let release: () => void = () => {}
    const answered = new Promise<void>((resolve) => {
      release = resolve
    })
    // La réponse est retenue jusqu'à `release()` pour observer l'état « Enregistrement… ».
    const { sent } = renderWithSaveResponses(async (input) => {
      await answered
      return jsonResponse(created(input), 201)
    })

    await user.click(saveButton())
    const saving = panel().getByRole('button', { name: 'Enregistrement…' })
    expect(saving).toHaveAttribute('aria-disabled', 'true')
    expect(saving).toHaveFocus()
    await user.click(saving)
    expect(nameField()).toHaveAttribute('readonly')
    expect(panel().getByRole('button', { name: 'Retirer « Vidéo numéro 1 »' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    await user.click(panel().getByRole('button', { name: 'Retirer « Vidéo numéro 1 »' }))
    expect(panel().getAllByRole('listitem')).toHaveLength(2)

    release()
    expect(
      await panel().findByRole('heading', { name: 'Séance « Atelier » enregistrée' }),
    ).toBeVisible()
    expect(sent).toHaveLength(1)
  })
})

describe('Séance incomplète ou refusée', () => {
  it('vérifie avant l’envoi : message sous le champ, focus dessus, effacé à la correction', async () => {
    const user = userEvent.setup()
    storeDraft('   ', [1])
    const { sent } = renderWithSaveResponses((input) => jsonResponse(created(input), 201))

    await user.click(saveButton())

    expect(nameField()).toHaveFocus()
    expect(nameField()).toHaveAttribute('aria-invalid', 'true')
    expect(nameField()).toHaveAccessibleDescription(/Le nom est obligatoire\./)
    expect(sent).toHaveLength(0)

    await user.type(nameField(), 'Atelier')
    expect(nameField()).not.toHaveAttribute('aria-invalid')
    expect(panel().queryByText('Le nom est obligatoire.')).toBeNull()
  })

  it('sans vidéo, explique qu’il faut en ajouter et y place le focus', async () => {
    const user = userEvent.setup()
    storeDraft('Atelier', [])
    renderWithSaveResponses((input) => jsonResponse(created(input), 201))

    await user.click(saveButton())

    expect(panel().getByText('Ajoutez au moins une vidéo depuis le catalogue.')).toHaveFocus()
  })

  it('affiche chaque message du serveur (422) sous le champ concerné', async () => {
    const user = userEvent.setup()
    storeDraft('Atelier', [1], 'pico-4')
    renderWithSaveResponses(() =>
      jsonResponse(
        {
          error: 'validation_error',
          message: 'Invalid session.',
          details: [{ field: 'headset_id', message: 'Modèle de casque inconnu.' }],
        },
        422,
      ),
    )

    await user.click(saveButton())

    const headset = panel().getByRole('combobox', { name: /Casque utilisé/ })
    await waitFor(() => expect(headset).toHaveFocus())
    expect(headset).toHaveAttribute('aria-invalid', 'true')
    expect(headset).toHaveAccessibleDescription('Modèle de casque inconnu.')
    // Une séance refusée n'est pas un échec réseau : pas de « Réessayer », le brouillon reste.
    expect(screen.queryByRole('alert')).toBeNull()
    expect(saveButton()).toBeVisible()
    expect(storedDraft()).toMatchObject({ name: 'Atelier', headsetId: 'pico-4' })
  })

  it('ne présente aucune violation axe, en erreur comme après l’enregistrement', async () => {
    const user = userEvent.setup()
    storeDraft('', [1])
    const { container } = renderWithSaveResponses((input) => jsonResponse(created(input), 201))
    await screen.findByRole('article', { name: 'Vidéo numéro 1' })

    await user.click(saveButton())
    expect((await axe(container)).violations).toEqual([])

    await user.type(nameField(), 'Atelier')
    await user.click(saveButton())
    await panel().findByRole('heading', { name: 'Séance « Atelier » enregistrée' })
    expect((await axe(container)).violations).toEqual([])
  })
})
