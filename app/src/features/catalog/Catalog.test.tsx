import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { catalogApi, videosPage } from '../../test/catalogFixtures'
import { jsonResponse, mockFetch } from '../../test/fetchMock'
import { createTestQueryClient, renderApp } from '../../test/renderApp'

// Tests d'interface du catalogue, sur l'application complète avec un faux serveur.

afterEach(() => {
  vi.unstubAllGlobals()
})

/** Paramètres envoyés au dernier appel de `GET /videos`. */
function lastVideosRequest(fetchMock: ReturnType<typeof mockFetch>) {
  const urls = fetchMock.mock.calls
    .map(([input]) => new URL(String(input)))
    .filter((url) => url.pathname === '/videos')
  return Object.fromEntries(urls.at(-1)?.searchParams ?? [])
}

function renderCatalog(path = '/') {
  return renderApp(path, createTestQueryClient())
}

describe('Catalogue', () => {
  it('affiche le nombre de vidéos et des cartes lisibles (intitulé du métier, durée, public)', async () => {
    mockFetch(catalogApi((url) => jsonResponse(videosPage(url, 30))))
    renderCatalog()

    // Le compteur est dans une région role="status" : il est annoncé par les lecteurs d'écran.
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('30 vidéos'))
    const card = screen.getByRole('article', { name: 'Vidéo numéro 1' })
    // Le code ROME n'est jamais affiché seul : on lit l'intitulé du métier.
    expect(await within(card).findByText('Mécanicien / Mécanicienne automobile')).toBeVisible()
    expect(within(card).queryByText('I1604')).toBeNull()
    expect(within(card).getByText('7 min 35 s')).toBeVisible()
    expect(within(card).getByText('Lycéen·nes')).toBeVisible()
    expect(within(card).getByText('Aperçu indisponible')).toBeVisible()
  })

  it('choisir un filtre met à jour l’URL, la requête et les puces', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetch(catalogApi((url) => jsonResponse(videosPage(url, 5))))
    const { router } = renderCatalog()

    const casque = await screen.findByRole('combobox', { name: 'Casque' })
    await waitFor(() => expect(casque).toBeEnabled())
    await user.selectOptions(casque, 'Meta Quest 3')

    await waitFor(() => expect(router.state.location.search).toBe('?headset=meta-quest-3'))
    await waitFor(() => expect(lastVideosRequest(fetchMock).headset).toBe('meta-quest-3'))
    expect(
      screen.getByRole('button', { name: 'Retirer le filtre Casque : Meta Quest 3' }),
    ).toBeVisible()
  })

  it('relit les filtres depuis l’URL au chargement (lien partagé, rechargement)', async () => {
    const fetchMock = mockFetch(catalogApi((url) => jsonResponse(videosPage(url, 5))))
    renderCatalog('/?audience=college&job=D1102')

    await waitFor(() =>
      expect(lastVideosRequest(fetchMock)).toMatchObject({ audience: 'college', job: 'D1102' }),
    )
    expect(
      await screen.findByRole('button', {
        name: 'Retirer le filtre Métier : Boulanger / Boulangère',
      }),
    ).toBeVisible()
    expect(screen.getByRole('combobox', { name: 'Public' })).toHaveValue('college')
  })

  it('sans résultat, propose « Effacer les filtres » qui remet tout à zéro', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetch(
      catalogApi((url) => jsonResponse(videosPage(url, url.searchParams.has('q') ? 0 : 12))),
    )
    const { router } = renderCatalog('/?q=astronaute&audience=lycee')

    expect(await screen.findByText('Aucune vidéo ne correspond à votre recherche')).toBeVisible()
    // Deux boutons « Effacer les filtres » : à côté des puces et dans l'état vide ; on prend le second.
    const [, inEmptyState] = screen.getAllByRole('button', { name: 'Effacer les filtres' })
    if (!inEmptyState) throw new Error('Bouton de l’état vide introuvable')
    await user.click(inEmptyState)

    await waitFor(() => expect(router.state.location.search).toBe(''))
    expect(await screen.findByText('12 vidéos')).toBeVisible()
    expect(lastVideosRequest(fetchMock)).toEqual({ page: '1', per_page: '24' })
    // Le focus revient sur la recherche plutôt que de se perdre.
    expect(
      screen.getByRole('combobox', { name: 'Rechercher un métier ou une vidéo' }),
    ).toHaveFocus()
  })

  it('en cas d’erreur, affiche « Réessayer » qui relance la même recherche', async () => {
    const user = userEvent.setup()
    let failures = 1
    const fetchMock = mockFetch(
      catalogApi((url) =>
        failures-- > 0
          ? jsonResponse({ error: 'internal_error' }, 500)
          : jsonResponse(videosPage(url, 3)),
      ),
    )
    renderCatalog('/?headset=pico-4')

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Le catalogue n’a pas pu être chargé')
    await user.click(within(alert).getByRole('button', { name: 'Réessayer' }))

    expect(await screen.findByText('3 vidéos')).toBeVisible()
    expect(lastVideosRequest(fetchMock).headset).toBe('pico-4')
  })

  it('« garagiste » propose le métier Mécanicien automobile et pose le filtre Métier', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetch(catalogApi((url) => jsonResponse(videosPage(url, 4))))
    const { router } = renderCatalog()

    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Métier' })).toBeEnabled())
    await user.type(
      screen.getByRole('combobox', { name: 'Rechercher un métier ou une vidéo' }),
      'garagiste',
    )
    await user.click(
      await screen.findByRole('option', { name: /Mécanicien \/ Mécanicienne automobile/ }),
    )

    await waitFor(() => expect(router.state.location.search).toBe('?job=I1604'))
    await waitFor(() => expect(lastVideosRequest(fetchMock).job).toBe('I1604'))
    expect(lastVideosRequest(fetchMock).q).toBeUndefined()
  })

  it('« Afficher plus » charge la suite et place le focus sur la première nouvelle vidéo', async () => {
    const user = userEvent.setup()
    mockFetch(catalogApi((url) => jsonResponse(videosPage(url, 30))))
    renderCatalog()

    const more = await screen.findByRole('button', { name: 'Afficher plus de vidéos (24 sur 30)' })
    await user.click(more)

    const firstNew = await screen.findByRole('heading', { name: 'Vidéo numéro 25' })
    await waitFor(() => expect(firstNew).toHaveFocus())
    expect(screen.getByText('Les 30 vidéos sont affichées.')).toBeVisible()
  })

  it('ne présente aucune violation axe avec des résultats et des filtres actifs', async () => {
    mockFetch(catalogApi((url) => jsonResponse(videosPage(url, 6))))
    const { container } = renderCatalog('/?headset=pico-4')
    await screen.findByRole('article', { name: 'Vidéo numéro 1' })
    await screen.findByRole('button', { name: 'Retirer le filtre Casque : Pico 4' })

    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
