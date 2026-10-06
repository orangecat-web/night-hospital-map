import { computed, onScopeDispose, ref, shallowRef } from 'vue'
import localHospitals from '../data/hospitals.json'
import apiSources from '../data/api-sources.json'
import { HospitalRepository } from '../services/HospitalRepository.js'

// 組合函式只管理資料狀態；搜尋、卡片與地圖不需要知道 API 的欄位格式。
export function useHospitals() {
  let storage = null
  try { storage = window.localStorage } catch { /* 禁用本機儲存仍可讀取 API。 */ }
  const repository = new HospitalRepository({
    local: localHospitals, sources: apiSources, storage,
    // BASE_URL 配合 Vite 相對路徑，放在 /night-hospital-map/ 子目錄仍可讀快照。
    snapshotUrl: `${import.meta.env.BASE_URL}data/hospital-registry.json`,
  })
  const state = shallowRef(repository.result(null, 'local'))
  const loading = ref(false)
  let activeRequest
  let disposed = false
  const modeLabels = { local: '人工查閱資料', snapshot: '部署名冊快照', cache: '本機名冊快取', live: '已取得政府 API', partial: '部分 API 更新成功' }
  const statusLabel = computed(() => modeLabels[state.value.mode])

  // 初次開站先有人工資料，再讀快照，最後查 API；任何階段失敗都不讓整站空白。
  async function load({ initial = false } = {}) {
    if (loading.value || disposed) return
    loading.value = true
    activeRequest = new AbortController()
    try {
      if (initial) state.value = await repository.loadBackup(activeRequest.signal)
      if (!disposed) {
        const next = await repository.refresh(state.value, activeRequest.signal)
        if (!disposed) state.value = next
      }
    } finally {
      loading.value = false
    }
  }

  // 離開頁面取消未完成的網路要求，不更新已卸載的畫面。
  onScopeDispose(() => { disposed = true; activeRequest?.abort() })
  return { state, loading, statusLabel, load }
}
