import test from 'node:test'
import assert from 'node:assert/strict'
import { directionsFromLocation, currentLocationMap, nearbyEmergencyMap } from '../src/services/locationLinks.js'

const location = { latitude: 25.03, longitude: 121.53 }
test('GPS 起點套用於導航，目的地地址安全編碼', () => {
  const url = new URL(directionsFromLocation('臺北市測試路1號 & 分院', location))
  assert.equal(url.searchParams.get('origin'), '25.03,121.53')
  assert.equal(url.searchParams.get('destination'), '臺北市測試路1號 & 分院')
  assert.equal(url.searchParams.get('api'), '1')
})
test('未定位、清除位置或錯誤座標時保留原本導航', () => {
  for (const point of [null, { latitude: 91, longitude: 121 }, { latitude: '25', longitude: 121 }]) {
    const url = new URL(directionsFromLocation('測試院所', point))
    assert.equal(url.searchParams.has('origin'), false)
    assert.equal(currentLocationMap(point), null)
    assert.equal(nearbyEmergencyMap(point), null)
  }
  assert.equal(directionsFromLocation('', location), null)
})
test('查看目前位置與附近搜尋使用取得的座標', () => {
  assert.equal(new URL(currentLocationMap(location)).searchParams.get('query'), '25.03,121.53')
  assert.equal(new URL(nearbyEmergencyMap(location)).hostname, 'www.google.com')
  assert.ok(nearbyEmergencyMap(location).endsWith('/@25.03,121.53,14z'))
})
