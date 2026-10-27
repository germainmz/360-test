import { useId, useState } from 'react'
import { usePageTitle } from '../../components/usePageTitle'
import { useFocusOnNavigation } from '../../hooks/useFocusOnNavigation'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { SessionBar } from '../session/SessionBar'
import { SessionDrawer } from '../session/SessionDrawer'
import { SessionPanel } from '../session/SessionPanel'
import { Catalog } from './Catalog'

/** Même seuil que `lg:` de Tailwind : tablette paysage (1024 px) et au-delà. */
const WIDE_SCREEN = '(min-width: 1024px)'

/**
 * Écran principal, tout le parcours sur un seul écran : catalogue à gauche, panneau « Ma séance »
 * à droite. En tablette portrait, le panneau devient une barre fixe en bas qui ouvre un tiroir.
 */
export function PreparePage() {
  usePageTitle('Préparer une séance')
  const isWide = useMediaQuery(WIDE_SCREEN, true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const panelHeadingId = useId()
  const headingRef = useFocusOnNavigation<HTMLHeadingElement>('prepare')

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)] lg:items-start lg:gap-8">
      <div className={`flex min-w-0 flex-col gap-6 ${isWide ? '' : 'pb-28'}`}>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-[32px] leading-10 font-bold outline-offset-4"
        >
          Préparer une séance
        </h1>
        <Catalog />
      </div>
      {isWide ? (
        <aside
          aria-labelledby={panelHeadingId}
          className="sticky top-6 flex max-h-[calc(100dvh-3rem)] flex-col rounded-xl border-2 border-border-subtle bg-surface"
        >
          <SessionPanel headingId={panelHeadingId} />
        </aside>
      ) : (
        <>
          <SessionBar onOpen={() => setDrawerOpen(true)} />
          <SessionDrawer isOpen={drawerOpen} onOpenChange={setDrawerOpen} />
        </>
      )}
    </div>
  )
}
