import { fetchEnabledSources, fetchJson } from './registryApi.js'
import { mergeHospitalData } from './registryNormalizer.js'

// 快取只保存公開院所資訊，不保存查詢字串、定位或其他使用者資料。
const CACHE_KEY = 'night-hospital-map:registry:v1'
const DAY = 24 * 60 * 60 * 1000
export const isSnapshotStale = (snapshot, now = Date.now()) => snapshot.sources.some((source) => now - Date.parse(source.fetchedAt) > 30 * DAY)

/** 驗證快取／快照的結構，避免舊版本、毀損資料或未知來源破壞畫面。 */
export function validateSnapshot(snapshot, allowedSources) {
  const ids = new Set(allowedSources.filter((source) => source.enabled).map((source) => source.id))
  if (snapshot?.schemaVersion !== 1 || !Array.isArray(snapshot.sources) || !snapshot.sources.length) return null
  if (new Set(snapshot.sources.map((source) => source.id)).size !== snapshot.sources.length) return null
  const valid = snapshot.sources.every((source) => ids.has(source.id) && Number.isFinite(Date.parse(source.fetchedAt)) && Array.isArray(source.records) && source.records.length && source.records.every((record) =>
    record && typeof record.id === 'string' && typeof record.name === 'string' && typeof record.city === 'string' && typeof record.address === 'string' && typeof record.phone === 'string' && record.sourceId === source.id && Array.isArray(record.registrySourceIds)))
  if (!valid) return null
  // 政府快取無權宣告夜間或即時狀態；查核資訊只能來自自己的 JSON。
  return { schemaVersion: 1, sources: snapshot.sources.map((source) => ({ ...source, records: source.records.map((record) => ({ ...record, nightVerified: false, allDay: null, emergency: null, openNow: null })) })) }
}

export class HospitalRepository {
  constructor({ local, sources, snapshotUrl, storage = null, fetchImpl = fetch }) {
    Object.assign(this, { local, sources, snapshotUrl, storage, fetchImpl })
  }

  readCache() {
    try { return validateSnapshot(JSON.parse(this.storage?.getItem(CACHE_KEY) ?? 'null'), this.sources) } catch { return null }
  }

  saveCache(snapshot) {
    try { this.storage?.setItem(CACHE_KEY, JSON.stringify(snapshot)) } catch { /* 無痕模式或容量不足時仍可查詢。 */ }
  }

  result(snapshot, mode, errors = []) {
    this.lastSnapshot = snapshot
    const sourceStates = snapshot?.sources.map(({ id, label, fetchedAt, rawCount, records }) => ({ id, label, fetchedAt, rawCount, count: records.length })) ?? []
    return { records: mergeHospitalData(snapshot?.sources.flatMap((source) => source.records) ?? [], this.local), mode, errors, sourceStates, stale: snapshot ? isSnapshotStale(snapshot) : false }
  }

  /** 先載入同站快照，沒有快照才用快取，最後還有原本人工查閱 JSON。 */
  async loadBackup(signal) {
    try {
      const data = await fetchJson(this.snapshotUrl, { fetchImpl: this.fetchImpl, signal, timeoutMs: 5000 })
      const snapshot = validateSnapshot(data, this.sources)
      if (snapshot) {
        const cache = this.readCache()
        // 有較新的瀏覽器快取時，不被舊部署快照覆蓋。
        const latest = (value) => Math.max(...value.sources.map((source) => Date.parse(source.fetchedAt)))
        if (cache && latest(cache) > latest(snapshot)) return this.result(cache, 'cache')
        return this.result(snapshot, 'snapshot')
      }
    } catch { /* 快照不存在時继续嘗試快取及人工 JSON。 */ }
    const cache = this.readCache()
    return this.result(cache, cache ? 'cache' : 'local')
  }

  /** 重新取得 API；失敗來源保留既有資料，但仍顯示錯誤與其原始擷取時間。 */
  async refresh(current, signal) {
    const live = await fetchEnabledSources(this.sources, { fetchImpl: this.fetchImpl, signal })
    if (!live.sources.length) return { ...current, errors: live.errors }
    // 快照內容由上次載入結果另存，避免從合併後卡片逆推而遺失原始官方紀錄。
    const available = this.lastSnapshot?.sources ?? []
    const nextSources = this.sources.filter((source) => source.enabled).flatMap((source) => {
      const found = live.sources.find((item) => item.id === source.id) ?? available.find((item) => item.id === source.id)
      return found ? [found] : []
    })
    const snapshot = { schemaVersion: 1, sources: nextSources }
    this.lastSnapshot = snapshot
    this.saveCache(snapshot)
    return this.result(snapshot, live.errors.length ? 'partial' : 'live', live.errors)
  }
}
