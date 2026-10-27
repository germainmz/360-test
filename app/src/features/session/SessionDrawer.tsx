import { useId } from 'react'
import { Dialog, Modal, ModalOverlay } from 'react-aria-components'
import { SessionPanel } from './SessionPanel'

interface SessionDrawerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

/**
 * Tiroir qui monte du bas de l'écran (tablette portrait). React Aria gère l'accessibilité de la
 * fenêtre : focus piégé à l'intérieur, `Échap` ou un appui sur le voile pour fermer, et retour
 * du focus sur le bouton « Voir ma séance ».
 */
export function SessionDrawer({ isOpen, onOpenChange }: SessionDrawerProps) {
  const headingId = useId()
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="fixed inset-0 z-30 bg-ink/50"
    >
      <Modal className="fixed inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl bg-surface shadow-xl">
        <Dialog aria-labelledby={headingId} className="flex min-h-0 flex-1 flex-col outline-none">
          <SessionPanel headingId={headingId} onClose={() => onOpenChange(false)} />
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
