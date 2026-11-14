<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { DirectoryQueryState, FilterChip, FilterSummary, RegionPicker, SearchField, ShareLinkButton } from '@orangecat/vue-components'
import HospitalCard from './components/HospitalCard.vue'
import LocationPreview from './components/LocationPreview.vue'
import SiteHeader from './components/SiteHeader.vue'
import DataStatus from './components/DataStatus.vue'
import UiIcon from './components/UiIcon.vue'
import petCompanions from './assets/clay-companions.webp'
import { useGeolocation } from './composables/useGeolocation.js'
import { useHospitals } from './composables/useHospitals.js'
import { taiwanCities } from './data/regions.js'
import { checkedAt, sources } from './data/sources.js'
import { HospitalDirectory } from './domain/HospitalDirectory.js'

const copyrightYear = new Date().getFullYear()

// 非同步資料有變動時重建查詢物件；computed 讓卡片數量、地區選單與地圖一起更新。
const { state, loading, statusLabel, load } = useHospitals()
const { location, locating, errorCode, locate, clear: clearLocation } = useGeolocation()
// 地圖焦點獨立於院所選取；新定位切到座標，點院所則回到院所嵌圖。
const showCurrentLocation = ref(false)
watch(location, (position) => { showCurrentLocation.value = !!position })
const directory = computed(() => new HospitalDirectory(state.value.records))
const sourceById = new Map(sources.map((source) => [source.id, source]))
const cities = taiwanCities
const reviewedCities = computed(() => new Set(state.value.records.filter((item) => item.nightVerified).map((item) => item.city)))
const queryState = new DirectoryQueryState({ cities, districts: (selectedCity) => directory.value.districts(selectedCity) })

// 名冊尚未載入前不要丟掉網址內的行政區；資料載完才檢查是否存在。
function readQuery({ pending = false } = {}) {
  const params = new URLSearchParams(window.location.search)
  const parsed = queryState.read(window.location.search)
  if (pending && parsed.city) parsed.district = (params.get('district') ?? '').slice(0, 8)
  return { ...parsed, scope: params.get('scope') === 'all' ? 'all' : 'night' }
}
const initial = readQuery({ pending: true })
const keyword = ref(initial.keyword)
const city = ref(initial.city)
const district = ref(initial.district)
const onlyAllDay = ref(initial.allDay)
const onlyEmergency = ref(initial.emergency)
const scope = ref(initial.scope)
const selectedId = ref(state.value.records[0]?.id ?? null)
const page = ref(1)
const pageSize = 20

// 桌機左右並排、平板單欄切換、手機使用 dialog；不卸載清單以保留展開狀態。
const mobileMedia = window.matchMedia('(max-width: 600px)')
const tabletMedia = window.matchMedia('(min-width: 601px) and (max-width: 1100px)')
const isMobile = ref(mobileMedia.matches)
const isTablet = ref(tabletMedia.matches)
const tabletView = ref('list')
const finderTitle = ref(null)
let listScroll = 0
let selectedTrigger
const mapOpen = ref(false)
const mapDialog = ref(null)
const mapSection = ref(null)
let unmounted = false
let toolLifecycle
let returnFocus
const districts = computed(() => directory.value.districts(city.value))
const currentQuery = computed(() => ({ keyword: keyword.value, city: city.value, district: district.value, allDay: onlyAllDay.value, emergency: onlyEmergency.value, scope: scope.value }))

// 共用類別處理原本欄位；scope 是此案新增的「夜間／全部名冊」查詢範圍。
function queryUrl(base, criteria, preserveOtherParams = true) {
  const url = queryState.url(base, criteria, { preserveOtherParams })
  url.searchParams.delete('scope')
  if (criteria.scope === 'all') url.searchParams.set('scope', 'all')
  return url
}
const shareUrl = computed(() => {
  const url = queryUrl(window.location.href, currentQuery.value, false)
  url.hash = ''
  return url.href
})
watch(currentQuery, (criteria) => {
  window.history.replaceState(window.history.state, '', queryUrl(window.location.href, criteria))
  page.value = 1
}, { flush: 'post' })
const filtered = computed(() => directory.value.search(currentQuery.value))
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const visibleHospitals = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
watch(pageCount, (count) => { if (page.value > count) page.value = count })
const cityWithoutSamples = computed(() => scope.value === 'night' && city.value && !reviewedCities.value.has(city.value))
const cityMapsSearchUrl = computed(() => `https://www.google.com.tw/maps/search/${encodeURIComponent(`${city.value} 動物急診`)}/`)
const activeFilters = computed(() => [
  keyword.value.trim() && { key: 'keyword', label: `搜尋：${keyword.value.trim()}` },
  city.value && { key: 'city', label: city.value },
  district.value && { key: 'district', label: district.value },
  onlyAllDay.value && { key: 'allDay', label: '24 小時' },
  onlyEmergency.value && { key: 'emergency', label: '提供急診' },
].filter(Boolean))
// 搜尋收起後仍顯示範圍與條件；沿用停車作品的原生 details，不卸載輸入元件。
const searchSummary = computed(() => [
  !city.value && '全台',
  scope.value === 'night' ? '已查閱夜間院所' : '全部院所名冊',
  ...activeFilters.value.map((filter) => filter.label),
].filter(Boolean).join('・'))

const selected = computed(() => filtered.value.find((item) => item.id === selectedId.value) ?? visibleHospitals.value[0] ?? null)

async function viewMap() {
  if (isMobile.value) {
    if (mapOpen.value) return
    returnFocus = document.activeElement
    mapOpen.value = true
    await nextTick()
    mapDialog.value?.showModal()
    return
  }
  if (isTablet.value) {
    if (tabletView.value === 'list') listScroll = window.scrollY
    tabletView.value = 'map'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'instant' })
    return
  }
  await nextTick()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  mapSection.value?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
}
function selectHospital(id) {
  selectedTrigger = document.activeElement
  showCurrentLocation.value = false
  selectedId.value = id
  if (isMobile.value || isTablet.value) viewMap()
}
async function showList({ focusSelection = false } = {}) {
  if (mapOpen.value) closeMap()
  tabletView.value = 'list'
  await nextTick()
  if (isTablet.value) window.scrollTo({ top: listScroll, behavior: 'instant' })
  if (focusSelection && selectedTrigger?.isConnected) selectedTrigger.focus({ preventScroll: true })
}
async function findHospitals() {
  await showList()
  finderTitle.value?.focus({ preventScroll: true })
}
function returnToLocation() {
  if (location.value) showCurrentLocation.value = true
}
function closeMap() { mapDialog.value?.close() }
function onMapClosed() {
  mapOpen.value = false
  nextTick(() => returnFocus?.isConnected && returnFocus.focus())
}
function syncViewport() {
  isMobile.value = mobileMedia.matches
  isTablet.value = tabletMedia.matches
  if (!isMobile.value && mapOpen.value) closeMap()
}

// 分頁只改清單，不向 API 重複抓資料，也不取消使用者選好的縣市與服務条件。
function changePage(next) {
  page.value = Math.min(Math.max(next, 1), pageCount.value)
  selectedId.value = null
  nextTick(() => document.querySelector('.results')?.scrollTo({ top: 0, behavior: 'auto' }))
}
function clearFilters() {
  keyword.value = ''; city.value = ''; district.value = ''
  onlyAllDay.value = false; onlyEmergency.value = false
}
function removeFilter(key) {
  if (key === 'keyword') keyword.value = ''
  if (key === 'city') { city.value = ''; district.value = '' }
  if (key === 'district') district.value = ''
  if (key === 'allDay') onlyAllDay.value = false
  if (key === 'emergency') onlyEmergency.value = false
}
function restoreFromUrl() {
  const parsed = readQuery()
  keyword.value = parsed.keyword; city.value = parsed.city; district.value = parsed.district
  onlyAllDay.value = parsed.allDay; onlyEmergency.value = parsed.emergency; scope.value = parsed.scope
}

onMounted(async () => {
  mobileMedia.addEventListener('change', syncViewport)
  tabletMedia.addEventListener('change', syncViewport)
  window.addEventListener('popstate', restoreFromUrl)
  await load({ initial: true })
  if (unmounted) return
  // 網路與快照均載完後，才移除資料裡不存在的行政區條件。
  if (district.value && !districts.value.includes(district.value)) district.value = ''

  // 支援 document.modelContext 的瀏覽器可以用工具篩選；一般瀏覽器不受影響。
  const context = document.modelContext
  if (!context?.registerTool) return
  toolLifecycle = new AbortController()
  const tool = {
    name: 'filter_hospital_directory', title: '篩選動物醫院',
    description: '設定地區、名稱、24 小時、急診與夜間／全部名冊範圍。沒有即時接診狀態。',
    inputSchema: {
      type: 'object',
      properties: { city: { type: 'string' }, district: { type: 'string' }, keyword: { type: 'string' }, allDay: { type: 'boolean' }, emergency: { type: 'boolean' }, scope: { type: 'string', enum: ['night', 'all'] } },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    async execute(input) {
      if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('請提供篩選條件。')
      if (Object.keys(input).some((key) => !['city', 'district', 'keyword', 'allDay', 'emergency', 'scope'].includes(key))) throw new Error('不支援的篩選條件。')
      for (const key of ['city', 'district', 'keyword']) if (input[key] !== undefined && typeof input[key] !== 'string') throw new Error(`${key} 必須是文字。`)
      for (const key of ['allDay', 'emergency']) if (input[key] !== undefined && typeof input[key] !== 'boolean') throw new Error(`${key} 必須是布林值。`)
      if (input.city && !cities.includes(input.city)) throw new Error('請選擇台灣縣市。')
      if (input.district && !directory.value.districts(input.city).includes(input.district)) throw new Error('名冊沒有該行政區。')
      if (input.scope !== undefined && !['night', 'all'].includes(input.scope)) throw new Error('請選擇有效查詢範圍。')
      city.value = input.city ?? ''; district.value = input.district ?? ''; keyword.value = input.keyword ?? ''
      onlyAllDay.value = input.allDay ?? false; onlyEmergency.value = input.emergency ?? false; scope.value = input.scope ?? 'night'
      await nextTick()
      return { count: filtered.value.length, names: filtered.value.slice(0, 20).map((item) => item.name), checkedAt, liveStatus: false }
    },
  }
  try { Promise.resolve(context.registerTool(tool, { signal: toolLifecycle.signal })).catch(() => {}) } catch { /* 此瀏覽器功能可選。 */ }
})
onUnmounted(() => {
  unmounted = true
  mobileMedia.removeEventListener('change', syncViewport)
  tabletMedia.removeEventListener('change', syncViewport)
  window.removeEventListener('popstate', restoreFromUrl)
  toolLifecycle?.abort()
})
</script>

<template lang="pug">
.site-shell.directory-shell
  SiteHeader(current="directory" @find="findHospitals")
  main.main-layout
    .finder-intro
      div
        h1(ref="finderTitle" tabindex="-1")
          span 陪毛孩，
          span 找到今晚的照顧
      img.pet-companions(:src="petCompanions" alt="" width="160" height="90")
    //- 平板以原生按鈕切換，使用 v-show 保留查詢、卡片詳情及列表閱讀位置。
    .view-switch(v-if="isTablet" role="group" aria-label="閱讀模式")
      button(type="button" :aria-pressed="tabletView === 'list'" @click="showList()")
        UiIcon(name="list")
        span 院所列表
      button(type="button" :aria-pressed="tabletView === 'map'" @click="viewMap")
        UiIcon(name="map")
        span 地圖
    .list-pane(v-show="!isTablet || tabletView === 'list'")
      //- 預設收合，summary 支援滑鼠、Enter 與空白鍵；查詢值在收合時保留。
      details.search-panel
        summary.search-toggle(aria-controls="hospital-search-controls")
          UiIcon(name="filter")
          .search-toggle-copy
            strong 搜尋與篩選
          span.search-toggle-state(aria-hidden="true")
            UiIcon(name="chevron")
        #hospital-search-controls.search-controls
          .search-intro
            p 可選全台 22 縣市，目前 {{ reviewedCities.size }} 縣市有已查閱夜間院所；先看資訊，再致電確認是否接診。
            .caution(role="note")
              span.caution-icon(aria-hidden="true") i
              span 政府名冊僅提供院所基本資料，夜間急診資訊另行查閱；出發前請先致電。
          .scope-switch(role="group" aria-label="查詢範圍")
            button(type="button" :aria-pressed="scope === 'night'" @click="scope = 'night'") 已查閱夜間院所
            button(type="button" :aria-pressed="scope === 'all'" @click="scope = 'all'") 全部院所名冊
          RegionPicker(v-model:city="city" v-model:district="district" :cities="cities" :districts="districts")
          SearchField.search-field(v-model="keyword" label="搜尋院所" placeholder="輸入院所名稱或地區")
          .filter-row(aria-label="篩選條件")
            FilterChip(:pressed="onlyAllDay" label="24 小時" @update:pressed="onlyAllDay = $event")
            FilterChip(:pressed="onlyEmergency" label="提供急診" @update:pressed="onlyEmergency = $event")
            FilterChip(:pressed="false" label="目前營業中" :disabled="true")
          p.filter-help 沒有即時接診資料；名冊開業狀態與 24 小時公告都不代表此刻可收治。
          details.data-disclosure
            summary 資料與更新資訊
            DataStatus(:state="state" :loading="loading" :label="statusLabel" @refresh="load()")
      p.search-summary(:title="searchSummary") {{ searchSummary }}
      //- 可捲動結果區含狀態、分頁與卡片，避免名冊增加後擠壓桌機地圖。
      .results
        .results-heading
          h2 {{ scope === 'night' ? '夜間院所' : '院所名冊' }}
            span.count(aria-live="polite") {{ filtered.length }} 間{{ scope === 'night' ? '已查閱夜間院所' : '名冊院所' }}
        p.results-status.sr-only(v-if="loading || state.errors.length" role="status") {{ loading ? '正在整理院所資訊…' : '暫用現有資料，更新詳情見搜尋面板。' }}
        p.registry-help(v-if="scope === 'all'") 此範圍包含夜間服務未確認的獸醫診療機構，不是全台急診名單。
        FilterSummary(:filters="activeFilters" @remove="removeFilter" @clear="clearFilters")
        .empty-state(v-if="filtered.length === 0" role="status")
          h3(v-if="cityWithoutSamples") {{ city }}目前尚未收錄已查閱夜間院所
          h3(v-else) 目前沒有符合條件的院所
          p(v-if="cityWithoutSamples") 這不代表當地沒有動物急診。可查看全部院所名冊，並致電確認服務。
          button.clear-button(v-if="cityWithoutSamples" type="button" @click="scope = 'all'; onlyAllDay = false; onlyEmergency = false") 查看全部院所名冊
          p(v-if="cityWithoutSamples")
            a(:href="cityMapsSearchUrl" target="_blank" rel="noopener noreferrer") 在 Google 地圖搜尋{{ city }}動物急診（請先致電確認） ↗
          p(v-else) 可以移除篩選或改選鄰近地區；政府名冊與本站查閱資料仍可能有缺漏。
          button.clear-button(v-if="activeFilters.length" type="button" @click="clearFilters") 清除全部條件
        .hospital-list(v-else)
          HospitalCard(v-for="item in visibleHospitals" :key="item.id" :hospital="item" :source="sourceById.get(item.sourceId)" :registry-sources="item.registrySourceIds.map(id => sourceById.get(id)).filter(Boolean)" :location="location" :selected="selected?.id === item.id" @select="selectHospital")
        nav.pagination(v-if="pageCount > 1" aria-label="院所分頁")
          button(type="button" :disabled="page === 1" @click="changePage(page - 1)") 上一頁
          span 第 {{ page }} / {{ pageCount }} 頁
          button(type="button" :disabled="page === pageCount" @click="changePage(page + 1)") 下一頁
        .share-row
          ShareLinkButton(:url="shareUrl" label="分享查詢")
        p.data-footnote 夜間資訊最後整理：{{ checkedAt }}。API 擷取不會重設官網查閱日；未逐一電話確認，實際收治請以院所回覆為準。
    div.desktop-map(ref="mapSection" v-show="!isMobile && (!isTablet || tabletView === 'map')")
      LocationPreview(v-if="!isMobile" :hospital="selected" :source="selected ? sourceById.get(selected.sourceId) : null" :location="location" :locating="locating" :error-code="errorCode" :show-current-location="showCurrentLocation" :show-back="isTablet" back-label="返回院所列表" @back="showList({ focusSelection: true })" @locate="locate" @clear="clearLocation" @show-location="returnToLocation")
  //- 底部地圖入口佔獨立列，列表只在上方捲動，不會蓋住院所操作。
  .mobile-map-dock(v-if="isMobile")
    button.mobile-map-launch.call-button(type="button" @click="viewMap")
      UiIcon(name="map")
      span 打開地圖
  footer.site-footer
    small © {{ copyrightYear }} OrangeCat · 夜間毛孩就醫
  //- 手機地圖資訊預設收合，沿用 v1.0 的互動方式。
  dialog.mobile-map-dialog(ref="mapDialog" aria-label="院所地圖" @close="onMapClosed")
    LocationPreview(v-if="mapOpen" :hospital="selected" :source="selected ? sourceById.get(selected.sourceId) : null" :location="location" :locating="locating" :error-code="errorCode" :show-current-location="showCurrentLocation" :collapsible="true" :show-back="true" @locate="locate" @clear="clearLocation" @show-location="returnToLocation" @back="closeMap")
</template>
