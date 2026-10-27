import { NavLink, Outlet } from 'react-router'
import { DraftProvider } from '../features/session/DraftProvider'
import { SaveSessionProvider } from '../features/session/SaveSessionProvider'
import { LiveAnnouncer } from './LiveAnnouncer'

// Onglet actif : souligné et en gras, pas seulement en couleur. min-h-11 = cible tactile de 44 px.
const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex min-h-11 items-center border-b-4 px-3 pt-1 text-lg sm:px-4',
    isActive
      ? 'border-action font-bold text-action'
      : 'border-transparent text-ink hover:text-action',
  ].join(' ')

/**
 * Cadre commun à toutes les pages ; la page courante s'affiche à la place de <Outlet />.
 * Le brouillon, son enregistrement et la région d'annonces sont ici pour survivre aux
 * changements de page.
 */
export function Layout() {
  return (
    <LiveAnnouncer>
      <DraftProvider>
        <SaveSessionProvider>
          {/* Lien d'évitement : invisible jusqu'à la première tabulation, il saute l'en-tête. */}
          <a
            href="#contenu"
            className="sr-only z-50 rounded-md border-2 border-action bg-surface text-lg font-semibold text-action focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:px-4 focus:py-3"
          >
            Aller au contenu
          </a>
          {/* Sous 640 px (téléphone, zoom 200 %), la navigation passe sous le logo au lieu de déborder. */}
          <header className="flex flex-wrap items-center gap-x-8 border-b border-border-subtle bg-surface px-4 pt-2 sm:h-16 sm:px-6 sm:pt-0">
            <NavLink to="/" className="flex min-h-11 items-center gap-2.5 rounded-md text-ink">
              {/* Logo décoratif : le nom « Métiers 360 » juste à côté suffit aux lecteurs d'écran. */}
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-full border-[3px] border-action"
              >
                <span className="size-3 rounded-full bg-accent" />
              </span>
              <span className="text-[22px] font-bold">Métiers 360</span>
            </NavLink>
            <nav
              aria-label="Navigation principale"
              className="flex w-full gap-1 sm:h-full sm:w-auto sm:gap-2"
            >
              <NavLink to="/" end className={navLinkClass}>
                Préparer une séance
              </NavLink>
              <NavLink to="/seances" className={navLinkClass}>
                Mes séances
              </NavLink>
            </nav>
          </header>
          {/* tabIndex -1 : le lien d'évitement peut y placer le focus sans l'ajouter à la tabulation. */}
          <main id="contenu" tabIndex={-1} className="px-4 py-6 outline-none sm:px-6">
            <Outlet />
          </main>
        </SaveSessionProvider>
      </DraftProvider>
    </LiveAnnouncer>
  )
}
