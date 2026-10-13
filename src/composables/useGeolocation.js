import { onUnmounted, ref } from 'vue'
import { getCurrentLocation } from '../vendor/orangecat-ui/geolocation.js'

// 定位只存於本次頁面記憶體；更新、清除及卸載會取消未完成請求。
export function useGeolocation() {
  const location = ref(null)
  const locating = ref(false)
  const errorCode = ref(null)
  let request
  let expiryTimer

  function clear() {
    request?.abort()
    request = undefined
    clearTimeout(expiryTimer)
    location.value = null
    locating.value = false
    errorCode.value = null
  }
  async function locate() {
    clear()
    const current = new AbortController()
    request = current
    locating.value = true
    try {
      const result = await getCurrentLocation({ signal: current.signal })
      if (request !== current) return
      location.value = result
      // 單次位置不是持續追蹤，五分鐘後停用舊起點，避免移動後誤用。
      expiryTimer = setTimeout(() => {
        location.value = null
        errorCode.value = 'expired'
      }, 5 * 60 * 1000)
    } catch (error) {
      if (request === current && error.code !== 'cancelled') errorCode.value = error.code ?? 'unavailable'
    } finally {
      if (request === current) {
        request = undefined
        locating.value = false
      }
    }
  }
  onUnmounted(clear)
  return { location, locating, errorCode, locate, clear }
}
