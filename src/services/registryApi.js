import { normalizeRegistry } from './registryNormalizer.js'

// 前端與同步腳本使用相同請求邏輯，避免一邊取得全量、一邊只拿第一頁。
export async function fetchJson(url, { fetchImpl = fetch, signal, timeoutMs = 15000 } = {}) {
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })
  if (signal?.aborted) controller.abort()
  const timer = setTimeout(abort, timeoutMs)
  try {
    const response = await fetchImpl(url, { signal: controller.signal, credentials: 'omit', headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`資料請求失敗（HTTP ${response.status}）`)
    // 防火牆有時回 200 + HTML，因此不能僅以 HTTP 200 判斷介接成功。
    if (!(response.headers.get('content-type') ?? '').includes('json')) throw new Error('資料來源未回傳 JSON')
    return await response.json()
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
}

export async function fetchRegistrySource(source, options = {}) {
  let rows
  if (source.adapter === 'ntpc') {
    rows = []
    const seenPages = new Set()
    // 新北 API 的頁碼從 0 開始；回傳少於一頁才算完整，超出上限就拒絕部分結果。
    for (let page = 0; page < 50; page++) {
      const url = new URL(source.endpoint)
      url.searchParams.set('page', String(page))
      url.searchParams.set('size', '100')
      const chunk = await fetchJson(url.href, options)
      if (!Array.isArray(chunk)) throw new Error('名冊格式不是陣列')
      const fingerprint = JSON.stringify(chunk)
      if (chunk.length && seenPages.has(fingerprint)) throw new Error('名冊分頁重複，無法確認完整性')
      seenPages.add(fingerprint)
      rows.push(...chunk)
      if (chunk.length < 100) break
      if (page === 49) throw new Error('名冊頁數超出上限，請檢查 API 分頁規格')
    }
  } else rows = await fetchJson(source.endpoint, options)
  return { id: source.id, label: source.label, fetchedAt: new Date().toISOString(), rawCount: rows.length, records: normalizeRegistry(rows, source) }
}

// 一個來源失敗不丟掉其他來源；每個來源的失敗都會回傳給畫面，不能假装全部成功。
export async function fetchEnabledSources(sources, options = {}) {
  const enabled = sources.filter((source) => source.enabled)
  const results = await Promise.allSettled(enabled.map((source) => fetchRegistrySource(source, options)))
  return {
    sources: results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []),
    errors: results.flatMap((result, index) => result.status === 'rejected' ? [{ id: enabled[index].id, label: enabled[index].label, message: result.reason?.message ?? '無法連線' }] : []),
  }
}
