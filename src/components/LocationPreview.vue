<script setup>
import { computed } from 'vue'
import { ContactLinks, MapEmbed, SourceLink } from '@orangecat/vue-components'
import mapEmbeds from '../data/map-embeds.json'

const props = defineProps({ hospital: { type: Object, default: null }, source: { type: Object, default: null } })
const emit = defineEmits(['back'])
const map = new MapEmbed(import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY)
const mapUrl = computed(() => props.hospital
  ? mapEmbeds[props.hospital.id] ?? map.place(props.hospital.address)
  : null)
</script>

<template lang="pug">
section.map-pane(aria-label="院所位置")
  .map-heading
    h2 位置查看
    span 點選院所卡片可切換位置資訊
    button.map-back(type="button" @click="emit('back')") 返回搜尋結果
  .map-stage
    iframe.map-iframe(v-if="mapUrl" :key="hospital.id" :src="mapUrl" :title="`${hospital.name} 的 Google 地圖`" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen)
    .map-empty-panel(v-else)
      span.map-pin(aria-hidden="true") ⌖
      strong {{ hospital ? hospital.city + '・' + hospital.district : '選擇一間院所' }}
      p {{ hospital ? '點擊下方「在 Google 地圖查看」，核對地址與位置。' : '調整篩選條件，查看院所地址與路線。' }}
    .map-selection(v-if="hospital" aria-live="polite")
      span.selection-kicker 已選院所
      strong {{ hospital.name }}
      span {{ hospital.address }}
      span(v-if="hospital.nightHours") 夜間急診 {{ hospital.nightHours }}{{ hospital.nightDays ? `・${hospital.nightDays}` : '' }}
      .selection-actions
        a(:href="ContactLinks.search(`${hospital.name} ${hospital.address}`)" target="_blank" rel="noopener noreferrer") 在 Google 地圖查看
        a(:href="ContactLinks.directions(hospital.address)" target="_blank" rel="noopener noreferrer") 路線導航
      SourceLink(v-if="source" :label="source.label" :href="source.url" :checked-at="hospital.checkedAt")
</template>
