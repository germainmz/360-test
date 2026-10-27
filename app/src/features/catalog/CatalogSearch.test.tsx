import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { jobs } from '../../test/catalogFixtures'
import { CatalogSearch } from './CatalogSearch'

// Synchronisation entre le champ de recherche et l'URL, testée sur le composant seul : on
// contrôle à la main le moment où l'URL « répond », pour reproduire une tablette lente.

function renderSearch(query = '') {
  const onQueryChange = vi.fn()
  const view = render(
    <CatalogSearch query={query} jobs={jobs} onQueryChange={onQueryChange} onJobSelect={vi.fn()} />,
  )
  const rerender = (nextQuery: string) =>
    view.rerender(
      <CatalogSearch
        query={nextQuery}
        jobs={jobs}
        onQueryChange={onQueryChange}
        onJobSelect={vi.fn()}
      />,
    )
  const input = screen.getByRole('combobox', { name: 'Rechercher un métier ou une vidéo' })
  return { input, onQueryChange, rerender }
}

describe('CatalogSearch', () => {
  // Régression : sous charge, « garagiste » devenait « gaagiste ».
  it('ne perd pas les lettres tapées pendant que l’URL se met à jour', async () => {
    const user = userEvent.setup()
    const { input, onQueryChange, rerender } = renderSearch()

    await user.type(input, 'ga')
    await waitFor(() => expect(onQueryChange).toHaveBeenLastCalledWith('ga'))
    await user.type(input, 'r')
    // L'URL renvoie « ga » alors que la personne a déjà tapé « gar ».
    rerender('ga')

    expect(input).toHaveValue('gar')
  })

  it('suit l’URL quand elle change ailleurs (« Effacer les filtres », retour arrière)', async () => {
    const user = userEvent.setup()
    const { input, onQueryChange, rerender } = renderSearch()

    await user.type(input, 'garage')
    await waitFor(() => expect(onQueryChange).toHaveBeenLastCalledWith('garage'))
    rerender('garage')
    rerender('')
    expect(input).toHaveValue('')

    rerender('boulanger')
    expect(input).toHaveValue('boulanger')
  })
})
