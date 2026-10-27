import { usePageTitle } from '../../components/usePageTitle'
import { Catalog } from './Catalog'

/** Écran principal : catalogue + panneau « Ma séance » (panneau ajouté à l'étape 5). */
export function PreparePage() {
  usePageTitle('Préparer une séance')
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[32px] leading-10 font-bold">Préparer une séance</h1>
      <Catalog />
    </div>
  )
}
