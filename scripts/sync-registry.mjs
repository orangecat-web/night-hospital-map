// 在自己的電腦或 CI 執行：抓政府 API → 正規化 → 寫入可部署的快照。
// 不需要金鑰，也不需要另架常駐後端；瀏覽器直接串 API 的方式仍保留。
import { mkdir, writeFile, rename } from 'node:fs/promises'
import apiSources from '../src/data/api-sources.json' with { type: 'json' }
import { fetchEnabledSources } from '../src/services/registryApi.js'

const directory = new URL('../public/data/', import.meta.url)
const destination = new URL('hospital-registry.json', directory)
const temporary = new URL('hospital-registry.json.tmp', directory)
try {
  // 有任一啟用來源失敗就保留舊快照，避免發布不完整／空白名冊。
  const result = await fetchEnabledSources(apiSources, { timeoutMs: 60000 })
  if (result.errors.length || !result.sources.length) throw new Error(result.errors.map((error) => `${error.label}：${error.message}`).join('\n') || '沒有啟用的來源')
  const snapshot = { schemaVersion: 1, sources: result.sources }
  await mkdir(directory, { recursive: true })
  await writeFile(temporary, JSON.stringify(snapshot, null, 2) + '\n', 'utf8')
  // 同資料夾 rename，寫入完成才換掉舊檔案。
  await rename(temporary, destination)
  for (const source of result.sources) console.log(`${source.label}：原始 ${source.rawCount} 筆 → 可顯示 ${source.records.length} 筆；擷取 ${source.fetchedAt}`)
} catch (error) {
  console.error('名冊同步失敗，既有快照未修改。\n' + error.message)
  process.exitCode = 1
}
