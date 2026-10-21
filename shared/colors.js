// Palette (0xRRGGBB, format attendu par hmUI)
export const COLORS = {
  green: 0x2ecc71,
  orange: 0xf39c12,
  red: 0xe74c3c,
  grey: 0x8e8e93,
  background: 0x000000,
  surface: 0x1c1c1e,
  text: 0xffffff,
  textMuted: 0xaeaeb2,
  textOnState: 0x000000
}

// Taille de police (px) et hauteur de ligne associée
export const FONT = {
  title: { size: 36, lineHeight: 44 },
  body: { size: 28, lineHeight: 36 },
  caption: { size: 22, lineHeight: 28 }
}

// Symbole en plus de la couleur (accessibilité)
export const SYMBOLS = {
  green: '✓',
  orange: '!',
  red: 'X',
  grey: '?'
}

// Mot affiché avec le symbole
export const STATE_LABELS = {
  green: 'OK',
  orange: 'Attention',
  red: 'Échec',
  grey: 'Inconnu'
}

// Ordre de tri : rouge → orange → gris → vert
export const STATE_ORDER = ['red', 'orange', 'grey', 'green']

export function colorOf(state) {
  return COLORS[state] || COLORS.grey
}

export function symbolOf(state) {
  return SYMBOLS[state] || SYMBOLS.grey
}

export function stateLabelOf(state) {
  return STATE_LABELS[state] || STATE_LABELS.grey
}
