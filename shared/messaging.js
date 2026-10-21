// Requêtes montre → side service, via zepp-bridge.
// Les codes d'erreur de la lib (OFFLINE, TIMEOUT, UNKNOWN_TYPE…) sont repris tels quels ;
// un handler peut aussi lever un code propre (AUTH, UPSTREAM…).

export const DEFAULT_TIMEOUT = 10000

export function request(type, payload = {}, { timeout = DEFAULT_TIMEOUT } = {}) {
  const { bridge } = getApp()._options.globalData
  return bridge.request(type, payload, { timeout })
}
