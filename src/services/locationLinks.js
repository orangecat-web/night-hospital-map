import { ContactLinks } from '../../packages/orange-vue-components/src/core/ContactLinks.js'
import { isGeoCoordinates } from '../vendor/orangecat-ui/geolocation.js'

// 定位成功後顯示 Google 定位點地圖；外開導航也會使用這組座標。
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
export function currentLocationEmbed(location) {
  if (!isGeoCoordinates(location)) return null
  const url = new URL('https://maps.google.com/maps')
  url.searchParams.set('q', `${location.latitude},${location.longitude}`)
  url.searchParams.set('z', '15')
  url.searchParams.set('output', 'embed')
  return url.href
}
export function nearbyEmergencyMap(location) {
  if (!isGeoCoordinates(location)) return null
  return `https://www.google.com/maps/search/${encodeURIComponent('動物急診')}/@${location.latitude},${location.longitude},14z`
}
