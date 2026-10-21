import * as hmUI from '@zos/ui'
import { push } from '@zos/router'
import { COLORS, FONT, STATE_ORDER, colorOf, symbolOf } from '../../shared/colors'
import { SCREEN_WIDTH, CONTENT_TOP, CONTENT_HEIGHT } from '../../shared/layout'
import { sortProbes, getStatus } from '../../shared/state'

const WIDTH = SCREEN_WIDTH
const MARGIN = 16
const LIST_WIDTH = WIDTH - 2 * MARGIN
const ROW_HEIGHT = 56
const ROW_GAP = 8
const SYMBOL_WIDTH = 44

// Un type de ligne par état : la couleur du symbole dépend du type
function itemConfig(state, typeId) {
  return {
    type_id: typeId,
    item_bg_color: COLORS.surface,
    item_bg_radius: 12,
    text_view: [
      {
        x: 8,
        y: 0,
        w: SYMBOL_WIDTH,
        h: ROW_HEIGHT,
        key: 'symbol',
        color: colorOf(state),
        text_size: 40
      },
      {
        x: 8 + SYMBOL_WIDTH + 8,
        y: 0,
        w: LIST_WIDTH - 8 - SYMBOL_WIDTH - 8 - 12,
        h: ROW_HEIGHT,
        key: 'label',
        color: COLORS.text,
        text_size: FONT.body.size,
        text_style: hmUI.text_style.ELLIPSIS
      }
    ],
    text_view_count: 2,
    item_height: ROW_HEIGHT
  }
}

Page({
  build() {
    const status = getStatus() || { probes: [] }
    const probes = sortProbes(status.probes)
    const data = probes.map((probe) => ({
      symbol: symbolOf(probe.state),
      label: probe.label
    }))
    const typeOf = (probe) => STATE_ORDER.indexOf(probe.state) + 1 || STATE_ORDER.indexOf('grey') + 1

    // Types contigus (la liste est triée par état) : data_type_config veut des plages
    const ranges = []
    probes.forEach((probe, i) => {
      const type = typeOf(probe)
      const last = ranges[ranges.length - 1]
      if (last && last.type_id === type) last.end = i
      else ranges.push({ start: i, end: i, type_id: type })
    })

    hmUI.createWidget(hmUI.widget.SCROLL_LIST, {
      x: MARGIN,
      y: CONTENT_TOP,
      w: LIST_WIDTH,
      h: CONTENT_HEIGHT,
      item_space: ROW_GAP,
      item_config: STATE_ORDER.map((state, i) => itemConfig(state, i + 1)),
      item_config_count: STATE_ORDER.length,
      data_array: data,
      data_count: data.length,
      data_type_config: ranges,
      data_type_config_count: ranges.length,
      item_click_func: (list, index) => {
        push({
          url: 'page/detail/detail',
          params: JSON.stringify({ id: probes[index].id })
        })
      }
    })
  }
})
