// 單次定位工具：不依賴 Vue、地圖供應商或專案資料，也不保存使用者座標。
export class GeolocationError extends Error {
  constructor(code) {
    super(code)
    this.name = 'GeolocationError'
    this.code = code
  }
}

export function isGeoCoordinates(value) {
  return !!value && Number.isFinite(value.latitude) && Math.abs(value.latitude) <= 90
    && Number.isFinite(value.longitude) && Math.abs(value.longitude) <= 180
}

// 呼叫端應在使用者操作後才呼叫；signal 取消只忽略回呼，瀏覽器權限提示無法撤回。
export function getCurrentLocation({
  signal, timeout = 15000, maximumAge = 0, enableHighAccuracy = true,
  geolocation = globalThis.navigator?.geolocation,
  secureContext = globalThis.isSecureContext === true,
} = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new GeolocationError('cancelled'))
    if (!secureContext) return reject(new GeolocationError('insecure'))
    if (!geolocation?.getCurrentPosition) return reject(new GeolocationError('unsupported'))
    if (!Number.isFinite(timeout) || timeout <= 0 || !Number.isFinite(maximumAge) || maximumAge < 0) {
      return reject(new GeolocationError('invalid-options'))
    }
    let settled = false
    let timer
    // 成功、失敗、逾時與取消共用清理，避免延遲回呼覆蓋下一次定位。
    function finish(error, position) {
      if (settled) return
      settled = true
      clearTimeout(timer)
      signal?.removeEventListener('abort', cancel)
      if (error) reject(error)
      else resolve(position)
    }
    function cancel() { finish(new GeolocationError('cancelled')) }
    signal?.addEventListener('abort', cancel, { once: true })
    // 瀏覽器可能等待權限而未啟動原生 timeout，另設整體等待上限。
    timer = setTimeout(() => finish(new GeolocationError('timeout')), timeout)
    try {
      geolocation.getCurrentPosition((position) => {
        const coords = position?.coords
        if (!isGeoCoordinates(coords) || !Number.isFinite(coords.accuracy) || coords.accuracy < 0
          || !Number.isFinite(position.timestamp)) {
          return finish(new GeolocationError('unavailable'))
        }
        // 僅回傳功能需要的資料，不帶入高度、速度或原生物件。
        finish(null, { latitude: coords.latitude, longitude: coords.longitude,
          accuracy: coords.accuracy, timestamp: position.timestamp })
      }, (error) => {
        const code = { 1: 'denied', 2: 'unavailable', 3: 'timeout' }[error?.code] ?? 'unavailable'
        finish(new GeolocationError(code))
      }, { timeout, maximumAge, enableHighAccuracy })
    } catch (error) {
      finish(new GeolocationError(error?.name === 'SecurityError' ? 'denied' : 'unavailable'))
    }
  })
}
