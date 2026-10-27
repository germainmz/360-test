// Exécuté avant chaque fichier de test (voir vite.config.ts).
// Ajoute les vérifications lisibles du DOM : toBeVisible(), toHaveAttribute()…
import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// Les écrans complets (catalogue + panneau) sont lents à rendre sous jsdom quand tous les
// fichiers de test tournent en parallèle : 1 s par défaut pour findBy… ne suffit pas toujours.
configure({ asyncUtilTimeout: 3000 })

// Vide la page et le brouillon enregistré entre deux tests pour qu'ils ne se perturbent pas.
afterEach(() => {
  cleanup()
  window.localStorage.clear()
})
