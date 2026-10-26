// Déclare les variables d'environnement connues pour que TypeScript les vérifie.
interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
