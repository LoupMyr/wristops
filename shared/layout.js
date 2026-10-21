// Écran Bip 5 : 320 × 380
export const SCREEN_WIDTH = 320
export const SCREEN_HEIGHT = 380

// Hauteur de la barre système (nom de l'app + heure), superposée au contenu.
// Valeur estimée : à ajuster si le contenu est encore mordu ou trop décalé.
export const STATUS_BAR_HEIGHT = 70

// Zone utilisable sous la barre
export const CONTENT_TOP = STATUS_BAR_HEIGHT
export const CONTENT_HEIGHT = SCREEN_HEIGHT - STATUS_BAR_HEIGHT

// Zone d'actions en bas des écrans de détail (vide en V1)
export const ACTIONS_HEIGHT = 56
export const ACTIONS_TOP = SCREEN_HEIGHT - ACTIONS_HEIGHT - 8
