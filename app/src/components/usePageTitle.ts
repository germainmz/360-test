import { useEffect } from 'react'

const APP_NAME = 'Métiers 360'

/**
 * Change le titre de l'onglet à chaque page : c'est la première chose annoncée par un lecteur
 * d'écran après une navigation, et ce qui permet de s'y retrouver entre plusieurs onglets.
 */
export function usePageTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · ${APP_NAME}`
  }, [title])
}
