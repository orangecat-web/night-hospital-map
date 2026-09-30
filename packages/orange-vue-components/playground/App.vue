<script setup>
import { computed, ref } from 'vue'
import { DirectoryCollection, DirectoryQueryState, SearchField, RegionPicker, FilterChip, FilterSummary, ShareLinkButton, DetailDisclosure, VerificationNotice, SourceLink } from '../src/index.js'

const directory = new DirectoryCollection([
  { id: 1, name: '示例工作室 A', city: '臺北市', district: '中正區', featured: true },
  { id: 2, name: '示例工作室 B', city: '新北市', district: '板橋區', featured: false },
], { searchFields: ['name', 'city', 'district'] })
const city = ref('')
const district = ref('')
const keyword = ref('')
const featured = ref(false)
const districts = computed(() => directory.districts(city.value))
const results = computed(() => directory.query({ city: city.value, district: district.value, text: keyword.value, predicates: featured.value ? [(item) => item.featured] : [] }))
const queryState = new DirectoryQueryState({ cities: directory.cities(), districts: (value) => directory.districts(value) })
const shareUrl = computed(() => queryState.url(window.location.href, { city: city.value, district: district.value, keyword: keyword.value }, { preserveOtherParams: false }).href)
const activeFilters = computed(() => [
  city.value && { key: 'city', label: city.value },
  district.value && { key: 'district', label: district.value },
  keyword.value && { key: 'keyword', label: `搜尋：${keyword.value}` },
  featured.value && { key: 'featured', label: '精選' },
].filter(Boolean))
function clear() { city.value = ''; district.value = ''; keyword.value = ''; featured.value = false }
function remove(key) {
  if (key === 'city') { city.value = ''; district.value = '' }
  if (key === 'district') district.value = ''
  if (key === 'keyword') keyword.value = ''
  if (key === 'featured') featured.value = false
}
</script>

<template lang="pug">
main.demo
  h1 OrangeCat Vue Components
  p Pug + Sass 共用元件的獨立練習場。
  RegionPicker(v-model:city="city" v-model:district="district" :cities="directory.cities()" :districts="districts")
  SearchField(v-model="keyword" label="搜尋" placeholder="名稱或地區")
  FilterChip(:pressed="featured" label="精選" @update:pressed="featured = $event")
  h2 結果：{{ results.length }}
  FilterSummary(:filters="activeFilters" @remove="remove" @clear="clear")
  ShareLinkButton(:url="shareUrl")
  ul
    li(v-for="item in results" :key="item.id") {{ item.name }}・{{ item.city }} {{ item.district }}
  p(v-if="!results.length") 沒有符合條件的示例，請調整或清除篩選。
  DetailDisclosure(label="示範詳情與查核說明")
    p 這裡可以放各專案自己的詳細欄位。
    VerificationNotice(checked-at="2026-09-29" source-label="示例資料")
  SourceLink(label="Vue 官方文件" href="https://vuejs.org/" checked-at="2026-09-29")
</template>

<style lang="sass" scoped>
.demo
  max-width: 720px
  margin: 40px auto
  padding: 24px
  font-family: system-ui, sans-serif
  color: #183036
  display: grid
  gap: 14px
  h1, h2, p
    margin: 0
</style>
