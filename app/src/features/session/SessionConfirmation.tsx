import { forwardRef } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import { buttonStyles } from '../../components/buttonStyles'
import { useDraft } from './draftContext'
import { describeDraft } from './describeDraft'
import { useSaveSession } from './saveSessionContext'

interface SessionConfirmationProps {
  /** Dans le tiroir : le referme en allant sur « Mes séances ». */
  onClose?: () => void
}

/**
 * Confirmation d'enregistrement, à la place du contenu du panneau (maquette 04, état 9). Le
 * ref vise le titre, qui reçoit le focus pour que la confirmation soit lue tout de suite.
 */
export const SessionConfirmation = forwardRef<HTMLHeadingElement, SessionConfirmationProps>(
  function SessionConfirmation({ onClose }, titleRef) {
    const { draft } = useDraft()
    const { startNew } = useSaveSession()

    return (
      <div className="flex flex-col items-center gap-5 rounded-xl bg-success-subtle px-5 py-8 text-center">
        <span
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded-full bg-success text-3xl font-bold text-surface"
        >
          ✓
        </span>
        <div role="status" className="flex flex-col gap-2">
          <h3 ref={titleRef} tabIndex={-1} className="text-xl font-bold outline-offset-4">
            Séance « {draft.name.trim()} » enregistrée
          </h3>
          <p>{describeDraft(draft)}</p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <Link to="/seances" onClick={onClose} className={`${buttonStyles.primary} w-full`}>
            Voir mes séances
          </Link>
          <Button variant="secondary" onClick={startNew} className="w-full">
            Préparer une nouvelle séance
          </Button>
        </div>
      </div>
    )
  },
)
