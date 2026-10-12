<script setup>
import { computed } from 'vue'
import messages from '../data/geolocation-messages.json'
import { currentLocationMap, nearbyEmergencyMap } from '../services/locationLinks.js'

const props = defineProps({ location: { type: Object, default: null }, locating: Boolean, errorCode: { type: String, default: null } })
const emit = defineEmits(['locate', 'clear'])
const errorMessage = computed(() => props.errorCode ? messages[props.errorCode] ?? messages.unavailable : '')
const locatedTime = computed(() => props.location ? new Date(props.location.timestamp).toLocaleTimeString('zh-TW', { hour12: false }) : '')
</script>

<template lang="pug">
section.gps-panel(aria-label="GPS 目前位置" :aria-busy="locating")
  .gps-actions
    button.gps-button(type="button" :disabled="locating" @click="emit('locate')") {{ locating ? '定位中…' : location ? '重新定位' : '取得目前位置' }}
    button.gps-clear(v-if="locating || location" type="button" @click="emit('clear')") {{ locating ? '取消定位' : '清除位置' }}
  .gps-status(role="status" aria-live="polite" aria-atomic="true")
    p(v-if="locating") 正在取得位置，請允許瀏覽器存取裝置位置。
    p.gps-error(v-else-if="errorMessage") {{ errorMessage }}
    p(v-else-if="location") 已取得位置（{{ locatedTime }}），估計誤差約 {{ Math.ceil(location.accuracy) }} 公尺。導航將以此位置為起點。
    p(v-else) 允許定位後，可從目前位置導航至院所。
  .gps-links(v-if="location")
    a(:href="currentLocationMap(location)" target="_blank" rel="noopener noreferrer") 在 Google 地圖查看目前位置 ↗
    a(:href="nearbyEmergencyMap(location)" target="_blank" rel="noopener noreferrer") 在 Google 地圖搜尋附近動物急診 ↗
  p.gps-help 單次定位，五分鐘後需更新；位置僅暫存此頁，開啟地圖／導航才傳給 Google。附近搜尋結果請先致電確認。
</template>
