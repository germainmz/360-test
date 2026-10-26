import { usePageTitle } from '../../components/usePageTitle'

export function SessionsPage() {
  usePageTitle('Mes séances')
  return <h1 className="text-[32px] leading-10 font-bold">Mes séances</h1>
}
