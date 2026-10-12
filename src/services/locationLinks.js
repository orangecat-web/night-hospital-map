import { ContactLinks } from '../../packages/orange-vue-components/src/core/ContactLinks.js'
import { isGeoCoordinates } from '../vendor/orangecat-ui/geolocation.js'

// 只有使用者開啟 Google 地圖連結時，才將目前座標提供給該服務。
export function directionsFromLocation(address, location) {
  const link = ContactLinks.directions(address)
  if (!link || !isGeoCoordinates(location)) return link
  const url = new URL(link)
  url.searchParams.set('origin', `${location.latitude},${location.longitude}`)
  return url.href
}
export function currentLocationMap(location) {
  return isGeoCoordinates(location) ? ContactLinks.search(`${location.latitude},${location.longitude}`) : null
}
export function nearbyEmergencyMap(location) {
  if (!isGeoCoordinates(location)) return null
  return `https://www.google.com/maps/search/${encodeURIComponent('動物急診')}/@${location.latitude},${location.longitude},14z`
}
