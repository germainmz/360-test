import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { ComboBox, Input, Label, ListBox, ListBoxItem, Popover } from 'react-aria-components'
import type { Job } from '../../api/types'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { createJobIndex } from '../../lib/jobIndex'

const SEARCH_DEBOUNCE_MS = 300

interface CatalogSearchProps {
  /** Texte de recherche actuellement dans l'URL. */
  query: string
  jobs: readonly Job[]
  onQueryChange: (query: string) => void
  onJobSelect: (job: Job) => void
}

/**
 * Champ de recherche unique. Le texte cherche dans les titres de vidéos (paramètre `q`), et des
 * suggestions « Métier : … » apparaissent quand il correspond à un métier ou à une appellation
 * (« garagiste ») : les choisir pose le filtre Métier, bien plus fiable que la recherche par titre.
 */
export const CatalogSearch = forwardRef<HTMLInputElement, CatalogSearchProps>(
  function CatalogSearch({ query, jobs, onQueryChange, onJobSelect }, ref) {
    const [inputValue, setInputValue] = useState(query)
    const debouncedValue = useDebouncedValue(inputValue, SEARCH_DEBOUNCE_MS)
    const searchJobs = useMemo(() => createJobIndex(jobs), [jobs])
    const suggestions = useMemo(() => searchJobs(inputValue), [searchJobs, inputValue])

    // Dernière valeur écrite dans l'URL par ce champ : sert à reconnaître l'« écho » de notre
    // propre écriture, qui peut revenir alors que la personne a continué à taper.
    const writtenQuery = useRef(query)

    useEffect(() => {
      const next = debouncedValue.trim()
      if (next === query) return
      writtenQuery.current = next
      onQueryChange(next)
      // `query` est volontairement absent : seule une nouvelle saisie doit écrire dans l'URL.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedValue])

    // L'URL a changé sans venir de ce champ (« Effacer les filtres », retour arrière) : on la suit.
    // L'écho de notre propre écriture est ignoré, sinon les lettres tapées entre-temps seraient perdues.
    useEffect(() => {
      if (query === writtenQuery.current) return
      writtenQuery.current = query
      setInputValue(query)
    }, [query])

    return (
      <ComboBox
        inputValue={inputValue}
        onInputChange={setInputValue}
        selectedKey={null}
        onSelectionChange={(key) => {
          const job = suggestions.find((match) => match.job.code === key)?.job
          if (!job) return
          setInputValue('')
          onJobSelect(job)
        }}
        items={suggestions}
        // Les suggestions sont déjà filtrées par l'index des métiers (appellations comprises).
        defaultFilter={() => true}
        allowsCustomValue
        menuTrigger="input"
        className="relative flex flex-col gap-2"
      >
        <Label className="text-lg font-semibold">Rechercher un métier ou une vidéo</Label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-4.5 size-5 -translate-y-1/2 rounded-full border-[3px] border-ink-muted"
          />
          <span
            aria-hidden="true"
            className="absolute top-9 left-8.5 h-[3px] w-2.5 rotate-45 rounded bg-ink-muted"
          />
          <Input
            ref={ref}
            type="search"
            placeholder="ex. : garagiste, coiffure, logistique"
            className="h-15 w-full rounded-xl border-2 border-border bg-surface pr-5 pl-14 text-lg text-ink placeholder:text-ink-muted"
          />
        </div>
        <Popover
          offset={6}
          className="w-(--trigger-width) rounded-xl border-2 border-border bg-surface p-2 shadow-lg"
        >
          <ListBox<(typeof suggestions)[number]> className="flex flex-col gap-0.5 outline-none">
            {({ job, matchedLabel }) => (
              <ListBoxItem
                id={job.code}
                textValue={job.label}
                className="flex min-h-13 cursor-pointer flex-col justify-center rounded-lg px-3.5 py-1.5 text-lg outline-none data-focused:bg-action-subtle data-focus-visible:outline-[3px] data-focus-visible:outline-focus"
              >
                <span>
                  <span className="text-base font-semibold text-ink-muted">Métier : </span>
                  <span className="font-semibold">{job.label}</span>
                </span>
                {matchedLabel !== job.label && (
                  <span className="text-base text-ink-muted">aussi appelé « {matchedLabel} »</span>
                )}
              </ListBoxItem>
            )}
          </ListBox>
        </Popover>
      </ComboBox>
    )
  },
)
