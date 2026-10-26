import { usePageTitle } from '../../components/usePageTitle'

/** Détail d'une séance enregistrée (/seances/:id). Contenu à venir (étape 7). */
export function SessionDetailPage() {
  usePageTitle('Détail de la séance')
  return <h1 className="text-[32px] leading-10 font-bold">Détail de la séance</h1>
}
