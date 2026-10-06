// 驗證真正影響就醫資訊的邊界：未知急診、分院誤合併、壞資料與網路失敗。
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import sources from '../src/data/api-sources.json' with { type: 'json' }
import local from '../src/data/hospitals.json' with { type: 'json' }
import { normalizeRegistry, normalizePhone, mergeHospitalData } from '../src/services/registryNormalizer.js'
import { fetchJson, fetchRegistrySource } from '../src/services/registryApi.js'
import { HospitalRepository, validateSnapshot } from '../src/services/HospitalRepository.js'
import { HospitalDirectory } from '../src/domain/HospitalDirectory.js'

const moa = sources[0]
const row = { 縣市: '台北市', 字號: '測試執照001', 狀態: '開業', 機構名稱: '測試動物醫院', 機構地址: '台北市中正區測試路一段10號1樓', 機構電話: '(02)1234-5678、02-87654321' }
const official = () => normalizeRegistry([row], moa)[0]
const reviewed = () => ({ id: 'local-test', city: '臺北市', district: '中正區', name: '測試動物醫院', address: '臺北市中正區測試路1段10號', phone: '02-1234-5678', allDay: true, emergency: true, checkedAt: '2026-09-30', sourceId: 'official-site' })
const snapshot = () => ({ schemaVersion: 1, sources: [{ id: moa.id, label: moa.label, fetchedAt: new Date().toISOString(), rawCount: 1, records: [official()] }] })
const jsonResponse = (data) => new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } })
const repository = (fetchImpl, options = {}) => new HospitalRepository({ local: [reviewed()], sources, snapshotUrl: '/snapshot', fetchImpl, ...options })

test('正規化台／臺、空值與多支電話，不宣告夜間或即時接診', () => {
  const item = official()
  assert.equal(item.city, '臺北市')
  assert.equal(item.district, '中正區')
  assert.equal(item.phone, '0212345678')
  assert.equal(item.allDay, null)
  assert.equal(item.emergency, null)
  assert.equal(item.openNow, null)
  assert.equal(normalizePhone('02-12345678#123'), '0212345678')
  assert.equal(normalizePhone(null), '')
  assert.equal(normalizePhone('12345'), '')
})

test('停業／補發與缺漏地址不冒充可用開業院所，變更格式須失敗', () => {
  assert.equal(normalizeRegistry([row, { ...row, 狀態: '補發', 字號: '2' }, { ...row, 狀態: '停業', 字號: '3' }, { ...row, 機構地址: '', 字號: '4' }], moa).length, 1)
  assert.throws(() => normalizeRegistry([{ message: 'bad schema' }], moa), /欄位格式/)
  assert.throws(() => normalizeRegistry([], moa), /有效資料/)
})

test('同院所去重、保留原始人工 ID、嵌圖地址及查閱日期', () => {
  const result = mergeHospitalData([official()], [reviewed()])
  assert.equal(result.length, 1)
  assert.equal(result[0].id, 'local-test')
  assert.equal(result[0].address, reviewed().address)
  assert.equal(result[0].checkedAt, '2026-09-30')
  assert.equal(result[0].registry.licenseNumber, '測試執照001')
  assert.equal(result[0].nightVerified, true)
})

test('同名／同電話但不同地址的分院不能合併夜間資訊', () => {
  const otherBranch = { ...official(), address: '臺北市中正區測試路2段20號' }
  const result = mergeHospitalData([otherBranch], [reviewed()])
  assert.equal(result.length, 2)
  assert.equal(result[1].allDay, null)
  assert.equal(result[0].registry, null)
})

test('篩選只接受已查閱服務，政府名冊未知值不混入急診', () => {
  const result = mergeHospitalData([official(), { ...official(), id: 'other', name: '別院', address: '臺北市中正區別路20號' }], [reviewed()])
  const directory = new HospitalDirectory(result)
  assert.equal(directory.search({}).length, 1)
  assert.equal(directory.search({ scope: 'all' }).length, 2)
  assert.equal(directory.search({ scope: 'all', allDay: true }).length, 1)
  assert.equal(directory.search({ scope: 'all', emergency: true }).length, 1)
})

test('HTTP 200 + HTML 視為錯誤，不覆蓋既有資料', async () => {
  await assert.rejects(fetchJson('https://example.invalid', { fetchImpl: async () => new Response('<html>blocked</html>', { headers: { 'content-type': 'text/html' } }) }), /JSON/)
  await assert.rejects(fetchJson('https://example.invalid', { fetchImpl: async () => new Response('down', { status: 503 }) }), /503/)
})

test('API 中斷沿用快照，顯示錯誤並可重試恢復', async () => {
  let online = false
  const repo = repository(async (url) => {
    if (url === '/snapshot') return jsonResponse(snapshot())
    if (!online) throw new Error('offline')
    return jsonResponse([row])
  })
  const backup = await repo.loadBackup()
  assert.equal(backup.mode, 'snapshot')
  const failed = await repo.refresh(backup)
  assert.equal(failed.records.length, 1)
  assert.equal(failed.errors.length, 1)
  online = true
  const live = await repo.refresh(failed)
  assert.equal(live.mode, 'live')
  assert.equal(live.errors.length, 0)
})

test('快照與快取都不可用時，原本人工 JSON 仍能查詢', async () => {
  const repo = repository(async () => { throw new Error('offline') }, { storage: { getItem() { throw new Error('disabled') } } })
  const backup = await repo.loadBackup()
  assert.equal(backup.mode, 'local')
  assert.equal(backup.records[0].nightVerified, true)
  const failed = await repo.refresh(backup)
  assert.equal(failed.records.length, 1)
  assert.equal(failed.errors.length, 1)
})

test('瀏覽器快取較新時優先使用，不因重新部署而退回舊名冊', async () => {
  const older = snapshot(); older.sources[0].fetchedAt = '2026-01-01T00:00:00Z'
  const repo = repository(async () => jsonResponse(older), { storage: { getItem: () => JSON.stringify(snapshot()) } })
  assert.equal((await repo.loadBackup()).mode, 'cache')
})

test('快取沒有權限宣告急診，畸形紀錄拒絕', () => {
  const tampered = snapshot(); tampered.sources[0].records[0].allDay = true
  assert.equal(validateSnapshot(tampered, sources).sources[0].records[0].allDay, null)
  tampered.sources[0].records[0].address = null
  assert.equal(validateSnapshot(tampered, sources), null)
})

test('新北分頁完整取得且拒絕重複頁，未啟用時不發請求', async () => {
  const ntpc = sources[1]
  const item = { name: '測試醫院', address: '新北市林口區測試路1號', tel: '02-26090000', animal_hospital_license: '1' }
  let pages = 0
  const response = await fetchRegistrySource(ntpc, { fetchImpl: async () => { pages++; return jsonResponse(pages === 1 ? Array.from({ length: 100 }, (_, i) => ({ ...item, animal_hospital_license: String(i) })) : [{ ...item, animal_hospital_license: '100' }]) } })
  assert.equal(pages, 2)
  assert.equal(response.records.length, 101)
  await assert.rejects(fetchRegistrySource(ntpc, { fetchImpl: async () => jsonResponse(Array(100).fill(item)) }), /分頁重複/)
  const repo = repository(async (url) => {
    assert.equal(url, moa.endpoint)
    return jsonResponse([row])
  })
  await repo.refresh(repo.result(null, 'local'))
})

test('要求逾時會取消，不無限停留在載入中', async () => {
  await assert.rejects(fetchJson('timeout', { timeoutMs: 5, fetchImpl: (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('timeout')))) }), /timeout/)
})

test('附帶的真實政府快照有效，合併後 ID 唯一且 23 筆人工資料完整保留', async () => {
  const stored = JSON.parse(await readFile(new URL('../public/data/hospital-registry.json', import.meta.url), 'utf8'))
  assert.ok(validateSnapshot(stored, sources))
  const result = mergeHospitalData(stored.sources.flatMap((source) => source.records), local)
  assert.equal(new Set(result.map((item) => item.id)).size, result.length)
  assert.equal(result.filter((item) => item.nightVerified).length, local.length)
  assert.ok(result.every((item) => item.openNow === null))
  assert.ok(result.filter((item) => !item.nightVerified).every((item) => item.allDay === null && item.emergency === null))
})
