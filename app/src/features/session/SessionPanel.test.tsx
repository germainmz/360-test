import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { catalogApi, makeVideo, videosPage } from '../../test/catalogFixtures'
import { jsonResponse, mockFetch } from '../../test/fetchMock'
import { createTestQueryClient, renderApp } from '../../test/renderApp'
import { MAX_VIDEOS } from './draftReducer'
import { DRAFT_STORAGE_KEY } from './draftStorage'

// Composition de la séance sur l'écran complet : cartes du catalogue + panneau « Ma séance ».

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderPrepare(path = '/') {
  mockFetch(catalogApi((url) => jsonResponse(videosPage(url, 6))))
  return renderApp(path, createTestQueryClient())
}

/** Brouillon déjà enregistré, comme après une visite précédente. */
function storeDraft(videos: ReturnType<typeof makeVideo>[], headsetId: string | null = null) {
  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ name: '', headsetId, videos }))
}

const panel = () => within(screen.getByRole('complementary', { name: 'Ma séance' }))
const sessionTitles = () =>
  panel()
    .queryAllByRole('listitem')
    .map((item) => item.querySelector('p')?.textContent?.replace(/^\d+\. /, ''))
const announcements = () => screen.getByTestId('annonces')

describe('Composer la séance', () => {
  it('se fait entièrement au clavier : ajouter 3 vidéos, monter la 3e en 1re, retirer la 2e', async () => {
    const user = userEvent.setup()
    renderPrepare()

    for (const n of [1, 2, 3]) {
      const add = await screen.findByRole('button', {
        name: `Ajouter à la séance : Vidéo numéro ${n}`,
      })
      add.focus()
      await user.keyboard('{Enter}')
      // Le même bouton devient « Retirer » : le focus n'est pas perdu.
      expect(
        screen.getByRole('button', { name: `Retirer de la séance : Vidéo numéro ${n}` }),
      ).toHaveFocus()
    }
    await waitFor(() =>
      expect(announcements()).toHaveTextContent('Ajoutée à la séance (3 vidéos, 23 min)'),
    )
    expect(sessionTitles()).toEqual(['Vidéo numéro 1', 'Vidéo numéro 2', 'Vidéo numéro 3'])

    const up = panel().getByRole('button', { name: 'Monter « Vidéo numéro 3 »' })
    up.focus()
    await user.keyboard('{Enter}{Enter}')
    expect(sessionTitles()).toEqual(['Vidéo numéro 3', 'Vidéo numéro 1', 'Vidéo numéro 2'])
    // Le focus suit la vidéo déplacée, même quand le bouton devient inactif (1re position).
    expect(panel().getByRole('button', { name: 'Monter « Vidéo numéro 3 »' })).toHaveFocus()
    expect(panel().getByRole('button', { name: 'Monter « Vidéo numéro 3 »' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    await waitFor(() => expect(announcements()).toHaveTextContent('Déplacée en position 1'))

    panel().getByRole('button', { name: 'Retirer « Vidéo numéro 1 »' }).focus()
    await user.keyboard('{Enter}')
    expect(sessionTitles()).toEqual(['Vidéo numéro 3', 'Vidéo numéro 2'])
    // Après un retrait, le focus va sur la vidéo suivante.
    expect(panel().getByRole('button', { name: 'Retirer « Vidéo numéro 2 »' })).toHaveFocus()
    await waitFor(() =>
      expect(announcements()).toHaveTextContent('« Vidéo numéro 1 » retirée de la séance'),
    )
    expect(panel().getByText('2 vidéos · 15 min')).toBeVisible()
  })

  it('après le retrait de la dernière vidéo, le focus va sur le titre du panneau', async () => {
    const user = userEvent.setup()
    storeDraft([makeVideo(1)])
    renderPrepare()

    await user.click(panel().getByRole('button', { name: 'Retirer « Vidéo numéro 1 »' }))
    expect(panel().getByRole('heading', { name: 'Ma séance' })).toHaveFocus()
    expect(panel().getByText('Ajoutez des vidéos depuis le catalogue')).toBeVisible()
  })

  it('conserve le brouillon après un rechargement de la page', async () => {
    const user = userEvent.setup()
    const first = renderPrepare()
    await user.click(
      await screen.findByRole('button', { name: 'Ajouter à la séance : Vidéo numéro 2' }),
    )
    await user.type(panel().getByRole('textbox', { name: /Nom de la séance/ }), 'Atelier 3e B')
    first.unmount()

    renderPrepare()
    expect(sessionTitles()).toEqual(['Vidéo numéro 2'])
    expect(panel().getByRole('textbox', { name: /Nom de la séance/ })).toHaveValue('Atelier 3e B')
    expect(
      await screen.findByRole('button', { name: 'Retirer de la séance : Vidéo numéro 2' }),
    ).toBeVisible()
  })

  it(`bloque l’ajout à ${MAX_VIDEOS} vidéos en expliquant pourquoi`, async () => {
    const user = userEvent.setup()
    storeDraft(Array.from({ length: MAX_VIDEOS }, (_, i) => makeVideo(100 + i)))
    renderPrepare()

    const add = await screen.findByRole('button', { name: 'Ajouter à la séance : Vidéo numéro 1' })
    expect(add).toHaveAttribute('aria-disabled', 'true')
    expect(add).toHaveAccessibleDescription(`La séance contient déjà ${MAX_VIDEOS} vidéos.`)
    await user.click(add)
    expect(panel().getAllByRole('listitem')).toHaveLength(MAX_VIDEOS)
    expect(panel().getByText('Limite atteinte')).toBeVisible()
  })

  it('signale les vidéos incompatibles avec le casque choisi et propose de filtrer le catalogue', async () => {
    const user = userEvent.setup()
    storeDraft([makeVideo(1), makeVideo(2, { compatible_headsets: ['meta-quest-3'] })])
    const { router } = renderPrepare()

    const headset = panel().getByRole('combobox', { name: /Casque utilisé/ })
    await waitFor(() => expect(within(headset).getAllByRole('option')).toHaveLength(3))
    await user.selectOptions(headset, 'Meta Quest 3')

    const [incompatible, compatible] = panel().getAllByRole('listitem')
    if (!incompatible || !compatible) throw new Error('Deux vidéos attendues dans la séance')
    expect(within(incompatible).getByText('Non compatible avec Meta Quest 3')).toBeVisible()
    expect(within(compatible).queryByText(/Non compatible/)).toBeNull()

    await user.click(
      panel().getByRole('button', { name: 'Afficher seulement les vidéos compatibles' }),
    )
    await waitFor(() => expect(router.state.location.search).toBe('?headset=meta-quest-3'))
  })

  it('ne présente aucune violation axe avec des vidéos dans la séance', async () => {
    storeDraft([makeVideo(1), makeVideo(2)], 'meta-quest-3')
    const { container } = renderPrepare()
    await screen.findByRole('article', { name: 'Vidéo numéro 1' })

    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})

describe('Tablette portrait', () => {
  it('affiche une barre fixe qui ouvre la séance dans un tiroir, fermé par Échap', async () => {
    vi.stubGlobal(
      'matchMedia',
      (
        query: string,
      ): Pick<MediaQueryList, 'matches' | 'addEventListener' | 'removeEventListener'> & {
        media: string
      } => ({
        matches: false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    )
    const user = userEvent.setup()
    storeDraft([makeVideo(1), makeVideo(2)])
    renderPrepare()

    expect(screen.queryByRole('complementary')).toBeNull()
    expect(screen.getByText(/2 vidéos · 15 min/)).toBeVisible()
    const open = screen.getByRole('button', { name: 'Voir et enregistrer' })
    await user.click(open)

    const dialog = await screen.findByRole('dialog', { name: 'Ma séance' })
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(2)
    // Le tiroir est rendu à la fin de <body> (portail) : on analyse toute la page.
    expect((await axe(document.body)).violations).toEqual([])
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    // Le focus revient sur le bouton qui a ouvert le tiroir.
    await waitFor(() => expect(open).toHaveFocus())
  })
})
