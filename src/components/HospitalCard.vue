<script setup>
import { computed, nextTick, ref } from 'vue'
import { ContactLinks, DetailDisclosure, SourceLink, VerificationNotice } from '@orangecat/vue-components'
import { normalizePhone } from '../services/registryNormalizer.js'
import { directionsFromLocation } from '../services/locationLinks.js'
import UiIcon from './UiIcon.vue'
import clinicIcon from '../assets/clay-clinic.webp'

// 展示元件只接收統一格式，不直接呼叫 API；父層決定資料來源與選取狀態。
const props = defineProps({ hospital: { type: Object, required: true }, source: { type: Object, default: null }, registrySources: { type: Array, default: () => [] }, location: { type: Object, default: null }, selected: { type: Boolean, default: false } })
const emit = defineEmits(['select'])
// 無電話、短碼或格式不明時不產生撥號連結；保留原始文字供人工核對。
const callNumber = computed(() => normalizePhone(props.hospital.phone))
const copyMessage = ref('')
const copyFallback = ref(false)
const phoneInput = ref(null)
// 撥號保留 tel 交由裝置處理；剪貼簿被拒絕時提供可選取的電話。
async function copyPhone() {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
    await navigator.clipboard.writeText(callNumber.value)
    copyFallback.value = false
    copyMessage.value = '電話已複製'
  } catch {
    copyFallback.value = true
    copyMessage.value = '請選取並複製電話'
    await nextTick()
    phoneInput.value?.select()
  }
}
const emergencyHours = computed(() => {
  const h = props.hospital
  if (!h.nightVerified) return '政府名冊未提供夜間急診時段，請向院所確認'
  if (h.nightHours) return `夜間急診 ${h.nightHours}${h.nightDays ? `・${h.nightDays}` : ''}`
  return h.allDay ? '官網標示全天急診；詳細班表請向院所確認' : '官網未列明夜間急診時段；請先向院所確認'
})
</script>

<template lang="pug">
article.hospital-card(:class="{ selected }")
  button.card-select(type="button" :aria-label="`查看 ${hospital.name} 的位置資訊`" @click="emit('select', hospital.id)")
    span.card-symbol
      img(:src="clinicIcon" alt="" width="54" height="54")
    span.card-copy
      span.card-heading
        strong {{ hospital.name }}
        UiIcon(name="arrow")
      //- 三態資料：true 才顯示服務標籤，null 不能被當成已確認「非 24 小時」。
      span.service-row
        span.service-tag(v-if="hospital.allDay === true") 官網標示 24 小時急診
        span.service-tag.muted(v-else-if="hospital.nightVerified") 夜間急診（非 24 小時）
        span.service-tag.registry-tag(v-else) 政府名冊・夜間服務未確認
      span.location
        UiIcon(name="pin")
        span {{ hospital.address }}
      span.status-line 接診狀態請先致電確認
      span.night-hours(v-if="hospital.nightHours") 夜間 {{ hospital.nightHours }}{{ hospital.nightDays ? `・${hospital.nightDays}` : '' }}
  .card-actions
    a.call-button(v-if="callNumber" :href="ContactLinks.phone(callNumber)" :aria-label="`撥打 ${hospital.name} ${hospital.phone}`")
      UiIcon(name="phone")
      span 先打電話
    span.phone-unavailable(v-else) {{ hospital.phoneRaw ? `電話待核對：${hospital.phoneRaw}` : '名冊未提供電話' }}
    a.route-button(:href="directionsFromLocation(hospital.address, location)" target="_blank" rel="noopener noreferrer" :aria-label="`以 Google 地圖${location ? '從目前位置' : ''}導航至 ${hospital.name}`")
      UiIcon(name="route")
      span 路線導航
  DetailDisclosure(label="院所詳情")
    .contact-row(v-if="callNumber")
      span {{ hospital.phone }}
      button.copy-phone(type="button" :aria-label="`複製 ${hospital.name} 的電話`" @click="copyPhone")
        UiIcon(name="copy")
        span 複製電話
      span.copy-message(role="status") {{ copyMessage }}
      input(v-if="copyFallback" ref="phoneInput" :value="callNumber" aria-label="可手動複製的電話" readonly @focus="$event.target.select()")
    dl.hospital-details
      div
        dt 地區與地址
        dd {{ hospital.city }}{{ hospital.district }}・{{ hospital.address }}
      div
        dt 急診時間
        dd {{ emergencyHours }}
      div
        dt 收治動物
        dd {{ hospital.species }}
      div
        dt 院所備註
        dd {{ hospital.note }}
      div(v-if="hospital.licenseNumber || hospital.registry")
        dt 開業名冊
        dd {{ hospital.registry?.licenseNumber || hospital.licenseNumber }}・{{ hospital.registry?.status || hospital.registryStatus }}（非即時營業狀態）
    //- 擷取名冊不能算查閱官網，僅人工紀錄顯示 VerificationNotice。
    VerificationNotice(v-if="hospital.nightVerified && source" :checked-at="hospital.checkedAt" :source-label="source.label")
    .card-source(v-if="source")
      SourceLink(:label="source.label" :href="source.url" :checked-at="hospital.checkedAt")
    .card-source(v-for="registrySource in registrySources.filter(item => item.id !== source?.id)" :key="registrySource.id")
      SourceLink(:label="registrySource.label" :href="registrySource.url")
</template>
