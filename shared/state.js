import { STATE_ORDER } from './colors'

// État le plus grave parmi les sondes (rouge > orange > gris > vert)
export function worstState(probes) {
  let worst = STATE_ORDER.length - 1
  for (const probe of probes) {
    const rank = STATE_ORDER.indexOf(probe.state)
    worst = Math.min(worst, rank === -1 ? STATE_ORDER.indexOf('grey') : rank)
  }
  return STATE_ORDER[worst]
}

// Nombre de sondes qui ne sont pas au vert
export function countProblems(probes) {
  return probes.filter((probe) => probe.state !== 'green').length
}

// Tri rouge → orange → gris → vert (stable : l'ordre d'origine est conservé à état égal)
export function sortProbes(probes) {
  const rank = (probe) => {
    const i = STATE_ORDER.indexOf(probe.state)
    return i === -1 ? STATE_ORDER.indexOf('grey') : i
  }
  return probes
    .map((probe, index) => ({ probe, index }))
    .sort((a, b) => rank(a.probe) - rank(b.probe) || a.index - b.index)
    .map(({ probe }) => probe)
}

// Dernier statut reçu, partagé entre les pages (globalData de l'app)
export function setStatus(status) {
  getApp()._options.globalData.status = status
}

export function getStatus() {
  return getApp()._options.globalData.status
}
