import * as hmUI from '@zos/ui'
import { push } from '@zos/router'
import { COLORS, FONT, colorOf, symbolOf } from '../../shared/colors'
import { worstState, countProblems, setStatus } from '../../shared/state'
import { SCREEN_WIDTH, SCREEN_HEIGHT, CONTENT_TOP } from '../../shared/layout'
import { formatTime } from '../../shared/format'
import { request } from '../../shared/messaging'

const WIDTH = SCREEN_WIDTH
const HEIGHT = SCREEN_HEIGHT
const RADIUS = 70
const CIRCLE_Y = CONTENT_TOP + 20 + RADIUS

function summaryText(problems) {
  if (problems === 0) return 'Tout va bien'
  return problems === 1 ? '1 problème' : `${problems} problèmes`
}

const ERROR_TEXTS = {
  OFFLINE: 'Téléphone injoignable',
  TIMEOUT: 'Pas de réponse',
  AUTH: 'Jeton refusé',
  UPSTREAM: 'Erreur du serveur'
}

function centeredText(opts) {
  return hmUI.createWidget(hmUI.widget.TEXT, {
    x: 0,
    w: WIDTH,
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    ...opts
  })
}

Page({
  build() {
    this.background = hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: WIDTH,
      h: HEIGHT,
      color: COLORS.background
    })
    this.showMessage('Chargement…')

    request('status.get')
      .then((status) => {
        setStatus(status)
        this.render(status)
      })
      .catch((err) => this.showMessage(ERROR_TEXTS[err.code] || 'Erreur', err.code))
  },

  clear() {
    ;(this.widgets || []).forEach((w) => hmUI.deleteWidget(w))
    this.widgets = []
  },

  showMessage(text, code) {
    this.clear()
    this.widgets = [
      centeredText({
        y: CIRCLE_Y - 30,
        h: 60,
        text,
        text_size: FONT.body.size,
        color: code ? colorOf('red') : COLORS.textMuted
      })
    ]
    if (code) {
      this.widgets.push(
        centeredText({
          y: CIRCLE_Y + 40,
          h: FONT.caption.lineHeight,
          text: code,
          text_size: FONT.caption.size,
          color: COLORS.textMuted
        })
      )
    }
  },

  render(status) {
    this.clear()
    const state = worstState(status.probes)
    const problems = countProblems(status.probes)
    const goToList = () => push({ url: 'page/list/list' })

    this.widgets = [
      hmUI.createWidget(hmUI.widget.CIRCLE, {
        center_x: WIDTH / 2,
        center_y: CIRCLE_Y,
        radius: RADIUS,
        color: colorOf(state)
      }),
      centeredText({
        y: CIRCLE_Y - 60,
        h: 120,
        text: symbolOf(state),
        text_size: 80,
        color: COLORS.textOnState
      }),
      centeredText({
        y: CIRCLE_Y + RADIUS + 16,
        h: FONT.title.lineHeight,
        text: summaryText(problems),
        text_size: FONT.title.size,
        color: COLORS.text
      }),
      centeredText({
        y: HEIGHT - FONT.caption.lineHeight - 12,
        h: FONT.caption.lineHeight,
        text: `Mis à jour ${formatTime(status.ts)}`,
        text_size: FONT.caption.size,
        color: COLORS.textMuted
      })
    ]

    // Tap n'importe où → liste
    this.widgets.concat(this.background).forEach((w) => w.addEventListener(hmUI.event.CLICK_UP, goToList))
  }
})
