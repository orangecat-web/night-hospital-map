<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ContactLinks, MapEmbed, SourceLink } from '@orangecat/vue-components'
import mapEmbeds from '../data/map-embeds.json'
import { currentLocationEmbed, directionsFromLocation } from '../services/locationLinks.js'
import GeolocationPanel from './GeolocationPanel.vue'
import UiIcon from './UiIcon.vue'

const props = defineProps({
  hospital: { type: Object, default: null }, source: { type: Object, default: null },
  collapsible: Boolean, showBack: Boolean, backLabel: { type: String, default: '關閉地圖' },
  location: { type: Object, default: null }, locating: Boolean,
  errorCode: { type: String, default: null }, showCurrentLocation: Boolean,
})
const emit = defineEmits(['back', 'locate', 'clear', 'show-location'])
const mapStage = ref(null)
const frameSize = ref(null)
let sizeObserver
let resizeTimer
let resolutionQuery
let pixelRatioTimer
const currentPixelRatio = () => Math.round((window.devicePixelRatio || 1) * 1000) / 1000
// 嵌圖只在可見且尺寸穩定後建立；F12 模擬還會改變 DPR，需一起同步。
function syncFrameSize() {
  clearTimeout(resizeTimer)
  const stage = mapStage.value
  if (!stage?.clientWidth || !stage.clientHeight) {
    clearInterval(pixelRatioTimer)
    pixelRatioTimer = null
    frameSize.value = null
    return
  }
  // F12 某些 DPR-only 切換連 resize／resolution 事件也不發出。
  // 僅在圖面可見時每 500ms 比對一個數值，實際改變才讀取尺寸並重建。
  if (!pixelRatioTimer) pixelRatioTimer = setInterval(() => {
    if (document.visibilityState === 'visible' && frameSize.value && frameSize.value.pixelRatio !== currentPixelRatio()) syncFrameSize()
  }, 500)
  // 旋轉或展開資訊時，待容器尺寸穩定後換一個相同內容的新 frame，避免沿用舊視窗。
  resizeTimer = setTimeout(() => {
    const width = mapStage.value?.clientWidth ?? 0
    const height = mapStage.value?.clientHeight ?? 0
    const pixelRatio = currentPixelRatio()
    if (!width || !height) {
      frameSize.value = null
    } else if (frameSize.value?.width !== width || frameSize.value?.height !== height || frameSize.value?.pixelRatio !== pixelRatio) {
      frameSize.value = { width, height, pixelRatio }
    }
  }, 120)
}
// 裝置模擬可以只改像素比而不改 CSS 寬高；ResizeObserver 不會通知這種情況。
function observeResolution() {
  resolutionQuery?.removeEventListener('change', onResolutionChange)
  resolutionQuery = window.matchMedia(`(resolution: ${currentPixelRatio()}dppx)`)
  resolutionQuery.addEventListener('change', onResolutionChange)
}
function onResolutionChange() {
  observeResolution()
  syncFrameSize()
}
onMounted(() => {
  sizeObserver = new ResizeObserver(syncFrameSize)
  sizeObserver.observe(mapStage.value)
  observeResolution()
  window.addEventListener('resize', syncFrameSize)
  syncFrameSize()
})
onUnmounted(() => {
  sizeObserver?.disconnect()
  resolutionQuery?.removeEventListener('change', onResolutionChange)
  window.removeEventListener('resize', syncFrameSize)
  clearTimeout(resizeTimer)
  clearInterval(pixelRatioTimer)
})
const map = new MapEmbed(import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY)
// 定位點與院所地圖獨立切換；不猜測院所座標，仍沿用已查核的分享嵌圖。
const locationMapUrl = computed(() => props.showCurrentLocation ? currentLocationEmbed(props.location) : null)
const showingCurrent = computed(() => !!locationMapUrl.value)
const mapUrl = computed(() => locationMapUrl.value ?? (props.hospital
  ? mapEmbeds[props.hospital.id] ?? map.place(props.hospital.address) : null))
const mapTitle = computed(() => showingCurrent.value ? '目前定位點的 Google 地圖' : `${props.hospital?.name ?? '院所'} 的 Google 地圖`)
</script>

<template lang="pug">
section.map-pane(:aria-label="showingCurrent ? '目前位置' : '院所位置'")
  .map-heading(v-if="showBack")
    h2 {{ showingCurrent ? '目前位置' : '院所位置' }}
    button.map-back(type="button" @click="emit('back')")
      UiIcon(:name="collapsible ? 'close' : 'back'")
      span {{ backLabel }}
  .map-stage(ref="mapStage")
    iframe.map-iframe(v-if="mapUrl && frameSize" :key="`${mapUrl}:${frameSize.width}x${frameSize.height}@${frameSize.pixelRatio}`" :src="mapUrl" :title="mapTitle" :width="frameSize.width" :height="frameSize.height" loading="eager" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen)
    .map-caption(v-if="!showBack")
      h2 {{ showingCurrent ? '目前位置' : '院所位置' }}
    .map-empty-panel(v-if="!mapUrl")
      UiIcon.map-pin(name="pin")
      strong {{ hospital ? hospital.city + '・' + hospital.district : '先選一間院所' }}
      p {{ hospital ? '這間院所尚無嵌入地圖，請用下方連結核對位置。' : '點選院所名稱查看位置，也可以先定位目前所在。' }}
    .map-controls
      GeolocationPanel(:location="location" :locating="locating" :error-code="errorCode" :show-current-location="showingCurrent" @locate="emit('locate')" @clear="emit('clear')" @show-location="emit('show-location')")
  //- 資訊列與 wireframe 相同：左邊選取院所、右邊路線；完整來源按需展開。
  .map-selection(v-if="hospital" aria-live="polite")
    .map-destination
      UiIcon(name="pin")
      details.map-destination-details
        summary
          span.selection-kicker 已選院所
          strong(:title="hospital.name") {{ hospital.name }}
          UiIcon(name="chevron")
        .map-extra
          p {{ hospital.address }}
          span(v-if="hospital.nightHours") 夜間 {{ hospital.nightHours }}{{ hospital.nightDays ? `・${hospital.nightDays}` : '' }}
          a(:href="ContactLinks.search(`${hospital.name} ${hospital.address}`)" target="_blank" rel="noopener noreferrer") 在 Google 地圖查看
          SourceLink(v-if="source" :label="source.label" :href="source.url" :checked-at="hospital.checkedAt")
    a.route-button.map-route(:href="directionsFromLocation(hospital.address, location)" target="_blank" rel="noopener noreferrer" :aria-label="`以 Google 地圖${location ? '從目前位置' : ''}導航至 ${hospital.name}`")
      UiIcon(name="route")
      span 查看路線
  p.map-footnote(v-else) 地圖位置與接診資訊，出發前請再向院所確認。
</template>
