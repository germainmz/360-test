import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { renderApp } from '../test/renderApp'

describe('Layout', () => {
  it('affiche le lien d’évitement, la navigation et le contenu principal', async () => {
    renderApp('/')

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
    await screen.findByRole('heading', { level: 1 })
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
