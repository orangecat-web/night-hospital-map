// 距離工具僅計算已核對座標的直線距離；本案 v1.1 仍未開放附近院所。
const radians = (degrees) => degrees * Math.PI / 180

export class DistanceDirectory {
  static validPoint(point) {
    return point && Number.isFinite(point.lat) && Number.isFinite(point.lng)
      && Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180
  }

  static kilometers(from, to) {
    if (!this.validPoint(from) || !this.validPoint(to)) return null
    const lat = radians(to.lat - from.lat)
    const lng = radians(to.lng - from.lng)
    const h = Math.sin(lat / 2) ** 2 + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(lng / 2) ** 2
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  }

  static canSort(records) {
    return records.length > 0 && records.every((item) => this.validPoint(item.coordinates))
  }

  static nearest(records, from) {
    if (!this.validPoint(from) || !this.canSort(records)) return null
    return [...records].sort((a, b) => this.kilometers(from, a.coordinates) - this.kilometers(from, b.coordinates))
  }
}
