// Exécuté avant chaque fichier de test (voir vite.config.ts).
// Ajoute les vérifications lisibles du DOM : toBeVisible(), toHaveAttribute()…
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Vide la page entre deux tests pour qu'ils ne se perturbent pas.
afterEach(() => {
  cleanup()
})
