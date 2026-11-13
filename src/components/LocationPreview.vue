<script setup>
import { computed } from 'vue'
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
  .map-stage
    iframe.map-iframe(v-if="mapUrl" :key="mapUrl" :src="mapUrl" :title="mapTitle" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen)
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
