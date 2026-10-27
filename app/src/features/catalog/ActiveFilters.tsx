import { useRef } from 'react'

export interface ActiveFilter {
  name: string
  /** Texte de la puce, ex. « Casque : Meta Quest 3 ». */
  label: string
}

interface ActiveFiltersProps {
  filters: ActiveFilter[]
  onRemove: (name: string) => void
  /** Où mettre le focus quand il n'y a plus aucune puce. */
  onEmpty: () => void
}

/**
 * Filtres actifs en puces : chaque puce entière est un bouton qui retire le filtre (grande cible
 * tactile). Après un retrait, le focus passe à la puce suivante plutôt que d'être perdu.
 */
export function ActiveFilters({ filters, onRemove, onEmpty }: ActiveFiltersProps) {
  const listRef = useRef<HTMLUListElement>(null)

  function remove(index: number, name: string) {
    onRemove(name)
    const remaining = filters.length - 1
    if (remaining === 0) {
      onEmpty()
      return
    }
    const nextIndex = Math.min(index, remaining - 1)
    // Après le rendu, la puce suivante occupe la place de celle retirée.
    requestAnimationFrame(() => {
      listRef.current?.querySelectorAll('button')[nextIndex]?.focus()
    })
  }

  if (filters.length === 0) return null

  return (
    <ul ref={listRef} aria-label="Filtres actifs" className="flex flex-wrap gap-3">
      {filters.map((filter, index) => (
        <li key={filter.name}>
          <button
            type="button"
            onClick={() => remove(index, filter.name)}
            aria-label={`Retirer le filtre ${filter.label}`}
            className="flex min-h-11 items-center gap-3 rounded-full border-2 border-action bg-action-subtle py-1 pr-1.5 pl-5 text-lg font-semibold text-ink hover:bg-surface"
          >
            {filter.label}
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-full bg-action text-xl leading-none text-surface"
            >
              ×
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
