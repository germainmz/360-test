import { useEffect, useRef } from 'react'
import { useNavigationType } from 'react-router'

/**
 * Place le focus sur l'élément (en général le titre) après un clic sur un lien de l'application :
 * sans cela, le focus reste sur un lien qui a disparu et le lecteur d'écran ne lit rien.
 * Rien au chargement initial ni avec Précédent / Suivant (le navigateur gère), ni pour un simple
 * changement de filtre (`replace`).
 *
 * `key` identifie le contenu affiché (ex. l'id de la séance) ; `null` = rien à focaliser.
 * `ready` attend que l'élément soit affiché (données chargées).
 */
export function useFocusOnNavigation<T extends HTMLElement>(key: string | null, ready = true) {
  const ref = useRef<T>(null)
  const navigationType = useNavigationType()
  const handledKey = useRef<string | null>(null)

  useEffect(() => {
    if (key === null) {
      handledKey.current = null
      return
    }
    if (!ready || handledKey.current === key) return
    handledKey.current = key
    if (navigationType === 'PUSH') ref.current?.focus()
  }, [key, ready, navigationType])

  return ref
}
