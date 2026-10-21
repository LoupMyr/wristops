function pad(n) {
  return n < 10 ? `0${n}` : `${n}`
}

// Timestamp Unix (secondes) → "HH:MM"
export function formatTime(ts) {
  const d = new Date(ts * 1000)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Secondes → "5 min 12 s" / "48 s"
export function formatDuration(seconds) {
  if (seconds < 60) return `${seconds} s`
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return sec ? `${min} min ${sec} s` : `${min} min`
}
