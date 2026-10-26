import type { ReactNode } from 'react'

interface FilterSelectProps {
  id: string
  label: string
  value: string
  /** Libellé de l'option « aucun filtre » (ex. « Tous les publics »). */
  allLabel: string
  onChange: (value: string) => void
  status: 'pending' | 'error' | 'success'
  onRetry: () => void
  children: ReactNode
}

/**
 * Liste déroulante native : sur tablette, elle ouvre le sélecteur du système, plus confortable
 * au doigt et parfaitement lu par VoiceOver. `children` = les <option> / <optgroup>.
 */
export function FilterSelect({
  id,
  label,
  value,
  allLabel,
  onChange,
  status,
  onRetry,
  children,
}: FilterSelectProps) {
  const errorId = `${id}-erreur`
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-lg font-semibold">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={status !== 'success'}
          aria-describedby={status === 'error' ? errorId : undefined}
          className="h-13 w-full cursor-pointer appearance-none rounded-[10px] border-2 border-border bg-surface pr-11 pl-4 text-lg text-ink disabled:cursor-wait disabled:bg-surface-muted"
        >
          <option value="">{status === 'pending' ? 'Chargement…' : allLabel}</option>
          {children}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-4.5 right-4.5 size-2.5 rotate-45 border-r-[3px] border-b-[3px] border-ink"
        />
      </div>
      {status === 'error' && (
        <p id={errorId} className="flex flex-wrap items-center gap-x-2 text-base text-danger">
          Liste indisponible.
          <button
            type="button"
            onClick={onRetry}
            className="min-h-11 font-semibold text-action underline underline-offset-4"
          >
            Réessayer
          </button>
        </p>
      )}
    </div>
  )
}
