import 'zepp-bridge/polyfill'
import { createBridge } from 'zepp-bridge/device'
import { getPackageInfo } from '@zos/app'
import * as ble from '@zos/ble'

App({
  globalData: {
    bridge: null,
    status: null
  },

  onCreate() {
    const { appId } = getPackageInfo()
    this.globalData.bridge = createBridge({ ble, appId }).connect()
  },

  onDestroy() {
    this.globalData.bridge && this.globalData.bridge.disconnect()
  }
})
