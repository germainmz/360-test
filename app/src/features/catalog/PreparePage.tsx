import { usePageTitle } from '../../components/usePageTitle'

/** Écran principal : catalogue + panneau « Ma séance ». Contenu à venir (étapes 4 à 6). */
export function PreparePage() {
  usePageTitle('Préparer une séance')
  return <h1 className="text-[32px] leading-10 font-bold">Préparer une séance</h1>
}
