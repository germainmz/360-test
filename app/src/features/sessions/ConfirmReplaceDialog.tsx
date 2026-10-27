import { useEffect, useId, useRef } from 'react'
import { Dialog, Modal, ModalOverlay } from 'react-aria-components'
import { Button } from '../../components/Button'
import type { Draft } from '../session/draftReducer'
import { describeDraft } from '../session/describeDraft'

interface ConfirmReplaceDialogProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
  draft: Draft
  sessionName: string
}

/**
 * Demande avant d'écraser une séance en préparation non enregistrée. Le bouton qui garde le
 * brouillon reçoit le focus : un appui sur Entrée par réflexe ne perd rien. `Échap` annule.
 */
export function ConfirmReplaceDialog({
  isOpen,
  onCancel,
  onConfirm,
  draft,
  sessionName,
}: ConfirmReplaceDialogProps) {
  const titleId = useId()
  const draftName = draft.name.trim()

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
      isDismissable
      className="fixed inset-0 z-30 flex items-center justify-center bg-ink/50 p-4"
    >
      <Modal className="w-full max-w-lg rounded-2xl bg-surface shadow-xl">
        <Dialog
          role="alertdialog"
          aria-labelledby={titleId}
          className="flex flex-col gap-4 p-6 outline-none"
        >
          <h2 id={titleId} className="text-2xl font-bold">
            Remplacer la séance en préparation ?
          </h2>
          <p className="text-lg">
            Votre séance en préparation
            {draftName ? ` « ${draftName} »` : ''}
            {draft.videos.length > 0 ? ` (${describeDraft(draft)})` : ''} n’a pas été enregistrée.
            Elle sera remplacée par une copie de « {sessionName} ».
          </p>
          <DialogActions onCancel={onCancel} onConfirm={onConfirm} />
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}

/**
 * Boutons du dialogue. Rendus à l'intérieur de `Dialog` pour que leur effet passe avant le sien :
 * React Aria laisse alors le focus sur « Garder ma séance en cours ».
 */
function DialogActions({
  onCancel,
  onConfirm,
}: Pick<ConfirmReplaceDialogProps, 'onCancel' | 'onConfirm'>) {
  const keepRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    keepRef.current?.focus()
  }, [])
  return (
    <div className="flex flex-wrap justify-end gap-3 pt-2">
      <Button ref={keepRef} variant="secondary" onClick={onCancel}>
        Garder ma séance en cours
      </Button>
      <Button onClick={onConfirm}>Remplacer</Button>
    </div>
  )
}
