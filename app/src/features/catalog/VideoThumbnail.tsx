import { useState } from 'react'

interface VideoThumbnailProps {
  src: string | null
  className?: string
  /** Miniature du panneau séance : visuel de remplacement sans texte. */
  compact?: boolean
}

/**
 * Vignette décorative (`alt=""`) : le titre est lu juste à côté. Si l'image manque (3 vidéos
 * sans vignette) ou ne se charge pas, on affiche un visuel de remplacement explicite.
 */
export function VideoThumbnail({ src, className = '', compact = false }: VideoThumbnailProps) {
  const [failed, setFailed] = useState(false)
  const showImage = src !== null && !failed

  return (
    <div className={`relative aspect-video overflow-hidden bg-surface-muted ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : compact ? null : (
        <div className="flex size-full flex-col items-center justify-center gap-2 text-ink-muted">
          <span
            aria-hidden="true"
            className="size-12 rounded-full border-[3px] border-dashed border-ink-muted"
          />
          <span className="text-base">Aperçu indisponible</span>
          {/* Les vignettes de l'API portent déjà leur badge 360° ; le visuel de remplacement aussi. */}
          <span className="absolute top-3 left-3 rounded-md bg-ink px-2.5 py-1 text-base font-bold text-surface">
            360°
          </span>
        </div>
      )}
    </div>
  )
}
