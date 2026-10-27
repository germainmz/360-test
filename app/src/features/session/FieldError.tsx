import { forwardRef } from 'react'

interface FieldErrorProps {
  id: string
  children: string
}

/**
 * Message d'erreur sous un champ, relié par `aria-describedby`. Icône + texte, pas seulement la
 * couleur. Focusable par script : il reçoit le focus quand il n'y a pas de champ à saisir
 * (« Ajoutez au moins une vidéo »).
 */
export const FieldError = forwardRef<HTMLParagraphElement, FieldErrorProps>(function FieldError(
  { id, children },
  ref,
) {
  return (
    <p
      id={id}
      ref={ref}
      tabIndex={-1}
      className="flex items-start gap-2 font-semibold text-danger outline-offset-4"
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-danger text-sm text-surface"
      >
        !
      </span>
      {children}
    </p>
  )
})
