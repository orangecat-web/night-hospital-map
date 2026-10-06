import { taiwanCities } from '../data/regions.js'

// API 與本地 JSON 共用這些純函式；不依賴 Vue、DOM 或網路，方便單独驗證。
export const cleanText = (value) => String(value ?? '').normalize('NFKC').trim()
export const cityName = (value) => cleanText(value).replaceAll('台', '臺')
const compact = (value) => cityName(value).replace(/[\s・．·（）()、，,\-]/g, '')
const nameKey = (value) => compact(value).replace(/(院區|旗艦院|總院|分院)$/, '')

// 僅比較院所所在建物；一段／1段、1樓等寫法差異不產生重複院所。
// 不用模糊地址或電話單獨合併，避免連鎖院所共用電話時混入其他分院的急診資訊。
export function addressKey(value) {
  const digits = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 }
  return compact(value)
    .replace(/[一二三四五六七八九](?=段|巷|弄|樓)/g, (digit) => digits[digit])
    .replace(/(?:地下)?\d+樓.*$/, '')
    .replace(/及.*$/, '')
}

// 政府電話可能含分機、多支電話；只把第一支可用的完整電話傳給 tel:，避免串成錯號。
export function normalizePhone(value) {
  const text = cleanText(value)
  const first = text.split(/[、,，;；/]|(?:分機|轉|ext\.?|#)/i)[0]
  const digits = first.replace(/[^0-9+]/g, '')
  return /^(?:0\d{8,9}|\+886\d{8,9})$/.test(digits) ? digits : ''
}

// 以固定字串雜湊產生穩定 ID；重新抓資料仍可維持同一筆院所選取狀態。
function stableId(value) {
  let hash = 2166136261
  for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  return (hash >>> 0).toString(36)
}

function districtFromAddress(address, city) {
  const local = cityName(address).replace(/^\d{3,6}/, '').replace(city, '')
  return local.match(/^(.{1,5}?(?:區|鄉|鎮|市))/)?.[1] ?? ''
}

/** 把政府 API 欄位轉成卡片共用格式。null 是未知，不能當成「沒有急診」。 */
export function normalizeRegistry(rows, source) {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('政府名冊沒有有效資料')
  const moa = source.adapter === 'moa'
  if (!['moa', 'ntpc'].includes(source.adapter)) throw new Error('未支援的資料來源格式')
  const field = moa ? '機構名稱' : 'name'
  if (!rows.some((row) => row && Object.hasOwn(row, field))) throw new Error('政府名冊欄位格式已變更')
  const result = []
  const ids = new Set()
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    // 補發、停業等狀態不自動推定開業；其他欄位缺漏的紀錄也不硬補。
    if (moa && cleanText(row['狀態']) !== '開業') continue
    const name = cleanText(row[field])
    const address = cityName(moa ? row['機構地址'] : row.address).replace(/^\d{3,6}\s*/, '')
    const city = moa ? cityName(row['縣市']) : taiwanCities.find((item) => address.startsWith(item)) ?? ''
    if (!name || !address || !taiwanCities.includes(city)) continue
    const licenseNumber = cleanText(moa ? row['字號'] : row.animal_hospital_license)
    const id = `${source.id}-${stableId(`${city}|${licenseNumber || name + '|' + addressKey(address)}`)}`
    if (ids.has(id)) continue
    ids.add(id)
    const phoneRaw = cleanText(moa ? row['機構電話'] : row.tel || row.mobile_phone)
    result.push({
      id, name, city, district: districtFromAddress(address, city), address,
      phone: normalizePhone(phoneRaw), phoneRaw, licenseNumber,
      registryStatus: moa ? cleanText(row['狀態']) : '名冊收錄',
      sourceId: source.id, registrySourceIds: [source.id],
      allDay: null, emergency: null, openNow: null, nightVerified: false,
      checkedAt: null, nightHours: null,
      species: '收治動物別請電話確認',
      note: '政府名冊未提供夜間急診與即時接診資訊，請先向院所確認。',
    })
  }
  if (!result.length) throw new Error('政府名冊沒有可顯示的開業紀錄')
  return result
}

function sameHospital(a, b) {
  if (a.city !== b.city || addressKey(a.address) !== addressKey(b.address)) return false
  const nameA = nameKey(a.name)
  const nameB = nameKey(b.name)
  const namesMatch = nameA && nameB && (nameA.includes(nameB) || nameB.includes(nameA))
  const phonesMatch = normalizePhone(a.phone) && normalizePhone(a.phone) === normalizePhone(b.phone)
  return Boolean(namesMatch || phonesMatch)
}

/** 官方基本資料＋人工查閱夜間資料：保留人工資料與地圖 ID，並留下官方對照欄位。 */
export function mergeHospitalData(registry, local) {
  const official = []
  const addressBuckets = new Map()
  // 多來源相同院所保留來源 ID；不因名冊數量增加就重复顯示同一筆。
  for (const item of registry) {
    const key = `${item.city}|${addressKey(item.address)}`
    const bucket = addressBuckets.get(key) ?? []
    const existing = bucket.find((candidate) => sameHospital(candidate, item))
    if (existing) existing.registrySourceIds = [...new Set([...existing.registrySourceIds, ...item.registrySourceIds])]
    else {
      const copy = { ...item, registrySourceIds: [...item.registrySourceIds] }
      official.push(copy)
      bucket.push(copy)
      addressBuckets.set(key, bucket)
    }
  }
  const used = new Set()
  const reviewed = local.map((item) => {
    const candidates = official.filter((candidate) => sameHospital(candidate, item))
    const matched = candidates.length === 1 ? candidates[0] : null
    if (matched) used.add(matched.id)
    return {
      ...item, openNow: null,
      nightVerified: item.emergency === true || item.allDay === true || Boolean(item.nightHours),
      registrySourceIds: matched?.registrySourceIds ?? [],
      registry: matched ? { id: matched.id, name: matched.name, address: matched.address, phone: matched.phone, licenseNumber: matched.licenseNumber, status: matched.registryStatus } : null,
    }
  })
  return [...reviewed, ...official.filter((item) => !used.has(item.id))]
}
