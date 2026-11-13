<script setup>
import { computed, ref } from 'vue'
import messages from '../data/geolocation-messages.json'
import { currentLocationMap, nearbyEmergencyMap } from '../services/locationLinks.js'
import UiIcon from './UiIcon.vue'
const props = defineProps({ location: { type: Object, default: null }, locating: Boolean, errorCode: { type: String, default: null }, showCurrentLocation: Boolean })
const emit = defineEmits(['locate', 'clear', 'show-location'])
const expanded = ref(false)
const errorMessage = computed(() => props.errorCode ? messages[props.errorCode] ?? messages.unavailable : '')
const locatedTime = computed(() => props.location ? new Date(props.location.timestamp).toLocaleTimeString('zh-TW', { hour12: false }) : '')
const label = computed(() => props.locating ? '定位中…' : props.location && !props.showCurrentLocation ? '回到定位點' : props.location ? '重新定位' : '定位')
function activate() {
  if (props.location && !props.showCurrentLocation) return emit('show-location')
  expanded.value = true
  emit('locate')
}
</script>

<template lang="pug">
section.gps-panel(aria-label="GPS 目前位置" :aria-busy="locating")
  .gps-actions
    button.gps-button(type="button" :disabled="locating" @click="activate")
      UiIcon(name="locate")
      span {{ label }}
    button.gps-options.icon-button(type="button" :aria-expanded="expanded" aria-label="定位選項與說明" @click="expanded = !expanded")
      UiIcon(name="chevron")
  .gps-popover(v-if="expanded")
    .gps-popover-heading
      strong 目前位置
      button.icon-button(type="button" aria-label="收起定位選項" @click="expanded = false")
        UiIcon(name="close")
    .gps-status(role="status" aria-live="polite" aria-atomic="true")
      p(v-if="locating") 正在取得位置，請允許瀏覽器存取裝置位置。
      p.gps-error(v-else-if="errorMessage") {{ errorMessage }}
      p(v-else-if="location") {{ locatedTime }} 定位・估計誤差約 {{ Math.ceil(location.accuracy) }} 公尺。
    p.gps-help 定位會將座標交給 Google 地圖顯示；只暫存本頁，五分鐘後需更新。
    button.gps-clear(v-if="locating || location" type="button" @click="emit('clear')") {{ locating ? '取消定位' : '清除位置' }}
    .gps-links(v-if="location")
      a(:href="currentLocationMap(location)" target="_blank" rel="noopener noreferrer") 外開目前位置 ↗
      a(:href="nearbyEmergencyMap(location)" target="_blank" rel="noopener noreferrer") 搜尋附近動物急診 ↗
    p.gps-help(v-if="location") 附近搜尋不代表正在接診，請先致電。
</template>
