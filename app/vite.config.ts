import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Une seule configuration pour le serveur de développement, le build et les tests (Vitest).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // Faux navigateur en mémoire : les tests tournent sans ouvrir de vrai navigateur.
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Traite aussi le CSS importé par les composants, comme dans le navigateur.
    css: true,
    // Un parcours clavier complet dépasse parfois 5 s sous charge (voir src/test/setup.ts).
    testTimeout: 15000,
  },
})
