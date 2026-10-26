import { Link } from 'react-router'
import { usePageTitle } from './usePageTitle'

/** Adresse inconnue (lien périmé, faute de frappe) : on explique et on propose une sortie. */
export function NotFoundPage() {
  usePageTitle('Page introuvable')
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-[32px] leading-10 font-bold">Page introuvable</h1>
      <p className="text-lg">Cette adresse ne correspond à aucune page.</p>
      <Link to="/" className="text-lg font-semibold text-action underline">
        Revenir à la préparation de séance
      </Link>
    </div>
  )
}
