import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { renderApp } from '../test/renderApp'

// Test de fumée : l'application démarre et son squelette commun (en-tête, navigation,
// contenu principal) respecte les règles d'accessibilité de CLAUDE.md.
describe('Layout', () => {
  it('affiche le lien d’évitement, la navigation et le contenu principal', async () => {
    renderApp('/')

    // On cherche les éléments par leur rôle et leur nom, comme un lecteur d'écran.
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Préparer une séance' }),
    ).toBeVisible()
    expect(screen.getByRole('link', { name: 'Aller au contenu' })).toHaveAttribute(
      'href',
      '#contenu',
    )
    expect(screen.getByRole('main')).toHaveAttribute('id', 'contenu')
    const nav = screen.getByRole('navigation', { name: 'Navigation principale' })
    expect(nav).toBeInTheDocument()
    // Le lien de la page courante est signalé aux lecteurs d'écran, pas seulement par la couleur.
    expect(screen.getByRole('link', { name: 'Préparer une séance' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('met à jour le titre de la page selon la route', async () => {
    renderApp('/seances')
    await waitFor(() => expect(document.title).toBe('Mes séances · Métiers 360'))
  })

  it('affiche une page 404 pour une adresse inconnue', async () => {
    renderApp('/nimporte-quoi')
    expect(await screen.findByRole('heading', { name: 'Page introuvable' })).toBeVisible()
  })

  it('ne présente aucune violation axe', async () => {
    const { container } = renderApp('/')
    // On attend que la page soit affichée avant de lancer l'analyse automatique axe.
    await screen.findByRole('heading', { level: 1 })
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })

  it('ne présente aucune violation axe sur la page 404', async () => {
    const { container } = renderApp('/nimporte-quoi')
    await screen.findByRole('heading', { name: 'Page introuvable' })
    expect((await axe(container)).violations).toEqual([])
  })
})
