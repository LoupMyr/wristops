import * as hmUI from '@zos/ui'
import { COLORS, FONT, colorOf, symbolOf, stateLabelOf } from '../../shared/colors'
import { SCREEN_WIDTH, CONTENT_TOP } from '../../shared/layout'
import { formatTime, formatDuration } from '../../shared/format'
import { getStatus } from '../../shared/state'

const MARGIN = 16
const WIDTH = SCREEN_WIDTH - 2 * MARGIN
const ROW_HEIGHT = 34
const KEY_WIDTH = 120

const CONCLUSIONS = {
  success: 'Succès',
  failure: 'Échec',
  in_progress: 'En cours',
  queued: 'En attente',
  cancelled: 'Annulé'
}

// Lignes « clé / valeur » propres à chaque type de sonde
const VARIANTS = {
  ci: (d) => [
    ['Résultat', CONCLUSIONS[d.conclusion] || d.conclusion],
    ['Branche', d.branch],
    ['Commit', d.sha],
    ['Durée', d.duration != null && formatDuration(d.duration)]
  ],
  deploy: (d) => [
    ['Environnement', d.env],
    ['Approbation', d.waiting ? 'En attente' : 'Aucune']
  ],
  http: (d) => [
    ['Code HTTP', d.status ? `${d.status}` : '—'],
    ['Latence', d.latencyMs ? `${d.latencyMs} ms` : '—']
  ]
}

function text(opts) {
  return hmUI.createWidget(hmUI.widget.TEXT, {
    align_v: hmUI.align.CENTER_V,
    text_style: hmUI.text_style.ELLIPSIS,
    ...opts
  })
}

function infoRows(probe) {
  const build = VARIANTS[probe.type]
  if (!build) return []
  return build(probe.detail || {}).filter(([, value]) => value)
}

let probeId = null

Page({
  onInit(params) {
    try {
      probeId = JSON.parse(params).id
    } catch (e) {
      probeId = null
    }
  },

  build() {
    const status = getStatus() || { ts: 0, probes: [] }
    const probe = status.probes.find((p) => p.id === probeId)

    if (!probe) {
      text({
        x: MARGIN,
        y: CONTENT_TOP,
        w: WIDTH,
        h: FONT.title.lineHeight,
        text: 'Sonde introuvable',
        text_size: FONT.body.size,
        color: COLORS.textMuted
      })
      return
    }

    // Gabarit commun : label, état, horodatage
    let y = CONTENT_TOP
    text({
      x: MARGIN,
      y,
      w: WIDTH,
      h: FONT.title.lineHeight,
      text: probe.label,
      text_size: FONT.title.size - 4,
      color: COLORS.text
    })
    y += FONT.title.lineHeight
    text({
      x: MARGIN,
      y,
      w: WIDTH,
      h: FONT.title.lineHeight,
      text: `${symbolOf(probe.state)} ${stateLabelOf(probe.state)}`,
      text_size: FONT.title.size,
      color: colorOf(probe.state)
    })
    y += FONT.title.lineHeight
    text({
      x: MARGIN,
      y,
      w: WIDTH,
      h: FONT.caption.lineHeight,
      text: `Mis à jour ${formatTime(status.ts)}`,
      text_size: FONT.caption.size,
      color: COLORS.textMuted
    })
    y += FONT.caption.lineHeight + 8

    // Variante selon le type
    infoRows(probe).forEach(([key, value]) => {
      text({
        x: MARGIN,
        y,
        w: KEY_WIDTH,
        h: ROW_HEIGHT,
        text: key,
        text_size: FONT.caption.size,
        color: COLORS.textMuted
      })
      text({
        x: MARGIN + KEY_WIDTH,
        y,
        w: WIDTH - KEY_WIDTH,
        h: ROW_HEIGHT,
        text: `${value}`,
        text_size: FONT.body.size - 2,
        color: COLORS.text
      })
      y += ROW_HEIGHT
    })

    // Zone d'actions (ACTIONS_TOP dans shared/layout.js) : masquée en V1, pas encore de boutons
  }
})
