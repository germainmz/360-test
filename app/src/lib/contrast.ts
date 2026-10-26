// Calcul du contraste selon la formule officielle WCAG 2.x :
// https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio

// Convertit une composante (0-255) en lumière réellement perçue (correction gamma sRGB).
function channelLuminance(channel: number): number {
  const c = channel / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hex: string): number {
  const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!match) throw new Error(`Couleur hexadécimale invalide : ${hex}`)
  const [r, g, b] = match.slice(1).map((part) => channelLuminance(parseInt(part, 16)))
  // L'œil est bien plus sensible au vert qu'au bleu, d'où ces poids.
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0)
}

/** Ratio de contraste WCAG 2.x entre deux couleurs `#rrggbb`. */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground)
  const b = relativeLuminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
