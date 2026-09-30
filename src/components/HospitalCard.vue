<script setup>
import { ContactLinks, DetailDisclosure, SourceLink, VerificationNotice } from '@orangecat/vue-components'

defineProps({ hospital: { type: Object, required: true }, source: { type: Object, required: true }, selected: { type: Boolean, default: false } })
const emit = defineEmits(['select'])
</script>

<template lang="pug">
article.hospital-card(:class="{ selected }")
  button.card-select(type="button" :aria-label="`查看 ${hospital.name} 的位置資訊`" @click="emit('select', hospital.id)")
    span.card-heading
      strong {{ hospital.name }}
      span.card-letter(aria-hidden="true") {{ hospital.city.slice(0, 1) }}
    span.service-row
      span.service-tag(v-if="hospital.allDay") 官網標示 24 小時急診
      span.service-tag.muted(v-else) 夜間急診（非 24 小時）
      span.service-tag(v-if="hospital.emergency") 提供急診
    span.status-line.unknown
      span.status-dot(aria-hidden="true")
      span 即時接診狀態未確認
    span.location {{ hospital.address }}
    span.night-hours(v-if="hospital.nightHours") 夜間急診 {{ hospital.nightHours }}{{ hospital.nightDays ? `・${hospital.nightDays}` : '' }}
  .card-actions
    a.call-button(:href="ContactLinks.phone(hospital.phone)" :aria-label="`撥打 ${hospital.name} ${hospital.phone}`") 致電 {{ hospital.phone }}
    a.route-button(:href="ContactLinks.directions(hospital.address)" target="_blank" rel="noopener noreferrer" :aria-label="`以 Google 地圖導航至 ${hospital.name}`") 導航
  DetailDisclosure(label="院所詳情與資料確認")
    dl.hospital-details
      div
        dt 地區與地址
        dd {{ hospital.city }}{{ hospital.district }}・{{ hospital.address }}
      div
        dt 急診時間
        dd {{ hospital.nightHours ? `夜間急診 ${hospital.nightHours}${hospital.nightDays ? `・${hospital.nightDays}` : ''}` : hospital.allDay ? '官網標示全天急診；詳細班表請向院所確認' : '官網未列明夜間急診時段；請先向院所確認' }}
      div
        dt 收治動物
        dd {{ hospital.species }}
      div
        dt 院所備註
        dd {{ hospital.note }}
    VerificationNotice(:checked-at="hospital.checkedAt" :source-label="source.label")
    .card-source
      SourceLink(:label="source.label" :href="source.url" :checked-at="hospital.checkedAt")
</template>
