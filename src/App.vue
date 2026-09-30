<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { DirectoryQueryState, FilterChip, FilterSummary, RegionPicker, SearchField, ShareLinkButton } from '@orangecat/vue-components'
import HospitalCard from './components/HospitalCard.vue'
import LocationPreview from './components/LocationPreview.vue'
import SiteHeader from './components/SiteHeader.vue'
import hospitals from './data/hospitals.json'
import { taiwanCities } from './data/regions'
import { checkedAt, sources } from './data/sources'
import { HospitalDirectory } from './domain/HospitalDirectory'

const directory = new HospitalDirectory(hospitals)
const sourceById = new Map(sources.map((source) => [source.id, source]))
const cities = taiwanCities
const reviewedCities = new Set(directory.cities())
const queryState = new DirectoryQueryState({ cities, districts: (selectedCity) => directory.districts(selectedCity) })
const initial = queryState.read(window.location.search)
const keyword = ref(initial.keyword)
const city = ref(initial.city)
const district = ref(initial.district)
const onlyAllDay = ref(initial.allDay)
const onlyEmergency = ref(initial.emergency)
const selectedId = ref(hospitals[0].id)
const mapSection = ref(null)
const resultsSection = ref(null)
const resultsHeading = ref(null)
let toolLifecycle

const districts = computed(() => directory.districts(city.value))
const currentQuery = computed(() => ({ keyword: keyword.value, city: city.value, district: district.value, allDay: onlyAllDay.value, emergency: onlyEmergency.value }))
const shareUrl = computed(() => {
  const url = queryState.url(window.location.href, currentQuery.value, { preserveOtherParams: false })
  url.hash = ''
  return url.href
})
watch(currentQuery, (state) => {
  const url = queryState.url(window.location.href, state)
  window.history.replaceState(window.history.state, '', url)
}, { flush: 'post' })
const filtered = computed(() => directory.search({ keyword: keyword.value, city: city.value, district: district.value, allDay: onlyAllDay.value, emergency: onlyEmergency.value }))
const cityWithoutSamples = computed(() => city.value && !reviewedCities.has(city.value))
const cityMapsSearchUrl = computed(() => `https://www.google.com.tw/maps/search/${encodeURIComponent(`${city.value} 動物急診`)}/`)
const activeFilters = computed(() => [
  keyword.value.trim() && { key: 'keyword', label: `搜尋：${keyword.value.trim()}` },
  city.value && { key: 'city', label: city.value },
  district.value && { key: 'district', label: district.value },
  onlyAllDay.value && { key: 'allDay', label: '24 小時' },
  onlyEmergency.value && { key: 'emergency', label: '提供急診' },
].filter(Boolean))
const selected = computed(() => filtered.value.find((item) => item.id === selectedId.value) ?? filtered.value[0] ?? null)
async function viewMap() {
  await nextTick()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  mapSection.value?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
}

async function viewResults() {
  await nextTick()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resultsSection.value?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  resultsHeading.value?.focus({ preventScroll: true })
}

function selectHospital(id) {
  selectedId.value = id
  if (window.matchMedia('(max-width: 850px)').matches) viewMap()
}

function clearFilters() {
  keyword.value = ''
  city.value = ''
  district.value = ''
  onlyAllDay.value = false
  onlyEmergency.value = false
}

function removeFilter(key) {
  if (key === 'keyword') keyword.value = ''
  if (key === 'city') { city.value = ''; district.value = '' }
  if (key === 'district') district.value = ''
  if (key === 'allDay') onlyAllDay.value = false
  if (key === 'emergency') onlyEmergency.value = false
}

function restoreFromUrl() {
  const state = queryState.read(window.location.search)
  keyword.value = state.keyword
  city.value = state.city
  district.value = state.district
  onlyAllDay.value = state.allDay
  onlyEmergency.value = state.emergency
}

onMounted(() => {
  window.addEventListener('popstate', restoreFromUrl)
  const context = document.modelContext
  if (!context?.registerTool) return
  toolLifecycle = new AbortController()
  const tool = {
    name: 'filter_hospital_directory',
    title: '篩選動物醫院樣本',
    description: '設定畫面上的地區、名稱、24 小時及急診篩選。此為已查閱官網的有限樣本，沒有即時接診狀態。',
    inputSchema: {
      type: 'object',
      properties: { city: { type: 'string' }, district: { type: 'string' }, keyword: { type: 'string' }, allDay: { type: 'boolean' }, emergency: { type: 'boolean' } },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    async execute(input) {
      if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('請提供篩選條件。')
      if (Object.keys(input).some((key) => !['city', 'district', 'keyword', 'allDay', 'emergency'].includes(key))) throw new Error('不支援的篩選條件。')
      for (const key of ['city', 'district', 'keyword']) if (input[key] !== undefined && typeof input[key] !== 'string') throw new Error(`${key} 必須是文字。`)
      for (const key of ['allDay', 'emergency']) if (input[key] !== undefined && typeof input[key] !== 'boolean') throw new Error(`${key} 必須是布林值。`)
      if (input.city && !cities.includes(input.city)) throw new Error('請選擇台灣縣市。')
      if (input.district && !directory.districts(input.city).includes(input.district)) throw new Error('此樣本沒有該行政區。')
      city.value = input.city ?? ''
      district.value = input.district ?? ''
      keyword.value = input.keyword ?? ''
      onlyAllDay.value = input.allDay ?? false
      onlyEmergency.value = input.emergency ?? false
      await nextTick()
      return { count: filtered.value.length, names: filtered.value.map((item) => item.name), checkedAt, liveStatus: false }
    },
  }
  try { Promise.resolve(context.registerTool(tool, { signal: toolLifecycle.signal })).catch(() => {}) } catch { /* Browser support is optional. */ }
})

onUnmounted(() => {
  window.removeEventListener('popstate', restoreFromUrl)
  toolLifecycle?.abort()
})
</script>

<template lang="pug">
.site-shell
  SiteHeader(current="directory")

  main.main-layout
    .list-pane
      .intro
        h1 尋找動物急診
        p 可選全台 22 縣市，目前 {{ reviewedCities.size }} 縣市有已查閱院所；先看資訊，再致電確認是否接診。
        .caution(role="note")
          span.caution-icon(aria-hidden="true") i
          span 目前只收錄部分官網查閱樣本，非全台完整名冊；無即時營業或接診資訊。出發前請先致電。

      .search-panel
        RegionPicker(v-model:city="city" v-model:district="district" :cities="cities" :districts="districts")
        SearchField.search-field(v-model="keyword" label="搜尋院所" placeholder="輸入院所名稱或地區")
        .filter-row(aria-label="篩選條件")
          FilterChip(:pressed="onlyAllDay" label="24 小時" @update:pressed="onlyAllDay = $event")
          FilterChip(:pressed="onlyEmergency" label="提供急診" @update:pressed="onlyEmergency = $event")
          FilterChip(:pressed="false" label="目前營業中" :disabled="true")
        p.filter-help 暫無可信的即時接診資料，因此不提供「目前營業中」篩選；24 小時不代表此刻可收治。

      .results(ref="resultsSection")
        .results-heading
          h2(ref="resultsHeading" tabindex="-1") 搜尋結果
            span.count(aria-live="polite") {{ filtered.length }} 間已查閱樣本
          button.map-jump(v-if="filtered.length" type="button" @click="viewMap") 查看位置

        FilterSummary(:filters="activeFilters" @remove="removeFilter" @clear="clearFilters")
        .share-row
          ShareLinkButton(:url="shareUrl")

        .empty-state(v-if="filtered.length === 0" role="status")
          h3(v-if="cityWithoutSamples") {{ city }}目前尚未收錄已查閱院所
          h3(v-else) 目前沒有符合條件的樣本
          p(v-if="cityWithoutSamples") 這僅表示本站尚無可核對的院所資料，不代表當地沒有動物急診。急需就醫時請直接聯絡附近院所。
          p(v-if="cityWithoutSamples")
            a(:href="sourceById.get('national-registry').url" target="_blank" rel="noopener noreferrer") 查詢農業部獸醫診療機構開業名冊（不代表提供夜間急診） ↗
          p(v-if="cityWithoutSamples")
            a(:href="cityMapsSearchUrl" target="_blank" rel="noopener noreferrer") 在 Google 地圖搜尋{{ city }}動物急診（請先致電確認） ↗
          p(v-else-if="activeFilters.length") 可以先移除一項篩選、改選鄰近地區，或清除全部條件重新查看。這份名單尚未涵蓋全台院所。
          p(v-else) 目前尚無可顯示的院所樣本，請稍後再查詢；如有緊急需求，請直接聯絡附近院所。
          button.clear-button(v-if="activeFilters.length" type="button" @click="clearFilters") 清除全部條件

        .hospital-list(v-else)
          HospitalCard(v-for="item in filtered" :key="item.id" :hospital="item" :source="sourceById.get(item.sourceId)" :selected="selected?.id === item.id" @select="selectHospital")

        p.data-footnote 名單最後整理：{{ checkedAt }}。各院所查閱日見卡片；未逐一電話確認，假日、滿診與收治動物別請以院所回覆為準。

    div(ref="mapSection")
      LocationPreview(:hospital="selected" :source="selected ? sourceById.get(selected.sourceId) : null" @back="viewResults")
</template>
