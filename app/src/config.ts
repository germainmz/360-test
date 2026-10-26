// Réglages lus au moment du build (variables VITE_*, voir .env.example).
const DEFAULT_API_URL = 'http://localhost:4000'

export const config = {
  // La barre finale est retirée pour pouvoir écrire `apiUrl + '/videos'` sans double « // ».
  apiUrl: (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, ''),
} as const
