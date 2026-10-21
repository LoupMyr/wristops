import { createBridge } from 'zepp-bridge/side'
import status from '../mocks/status'

const bridge = createBridge()

// Un handler par `type` de message. Retourne le résultat, ou lève une erreur { code, message }.
bridge.handle('status.get', () => status)

AppSideService({
  onInit() {
    bridge.connect()
  },

  onRun() {},

  onDestroy() {}
})
