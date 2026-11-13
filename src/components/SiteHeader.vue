<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import UiIcon from './UiIcon.vue'
const props = defineProps({ current: { type: String, default: 'directory' } })
const emit = defineEmits(['find'])
const root = props.current === 'sources' ? '../' : './'
const helpDialog = ref(null)
const helpOpen = ref(false)
const menu = ref(null)
const menuToggle = ref(null)
let returnFocus
function find(event) {
  if (props.current !== 'directory') return
  event.preventDefault()
  if (menu.value) menu.value.open = false
  emit('find')
}
// 原生 dialog 提供焦點圈限與 Esc；關閉後把焦點還給開啟的按鈕。
function openHelp() {
  returnFocus = document.activeElement
  if (menu.value?.open) {
    returnFocus = menuToggle.value
    menu.value.open = false
  }
  helpOpen.value = true
  helpDialog.value.showModal()
}
function closed() {
  helpOpen.value = false
  nextTick(() => returnFocus?.isConnected && returnFocus.focus())
}
function backdropClick(event) {
  if (event.target === event.currentTarget) helpDialog.value.close()
}
function closeOutside(event) {
  if (menu.value?.open && !menu.value.contains(event.target)) menu.value.open = false
}
function closeMenu() {
  menu.value.open = false
  menuToggle.value.focus()
}
onMounted(() => document.addEventListener('click', closeOutside))
onUnmounted(() => document.removeEventListener('click', closeOutside))
</script>

<template lang="pug">
header.site-header
  a.brand(:href="root" aria-label="夜間毛孩就醫・返回院所列表" @click="find")
    UiIcon.brand-mark(name="paw")
    span 夜間毛孩就醫
  nav.site-nav(aria-label="主要導覽")
    a(:href="root" :aria-current="current === 'directory' ? 'page' : undefined" @click="find") 找醫院
    button(type="button" :aria-expanded="helpOpen" aria-haspopup="dialog" @click="openHelp") 使用說明
  details.mobile-nav(ref="menu" @keydown.esc.prevent="closeMenu")
    summary.icon-button(ref="menuToggle" aria-label="導覽選單")
      UiIcon(name="menu")
    .mobile-nav-menu
      a(:href="root" @click="find") 找醫院
      button(type="button" aria-haspopup="dialog" @click="openHelp") 使用說明
dialog.help-dialog(ref="helpDialog" aria-labelledby="help-title" @close="closed" @click="backdropClick")
  .help-heading
    span.eyebrow 陪你一步一步，找到照顧
    button.icon-button(type="button" aria-label="關閉使用說明" @click="helpDialog.close()")
      UiIcon(name="close")
  h2#help-title 怎麼陪毛孩找到照顧
  .help-steps
    section
      span.help-step-icon
        UiIcon(name="phone")
      div
        h3 先致電，確認是否接診
        p 點「先打電話」交給裝置撥號。若裝置不支援，可在院所詳情中複製電話；請先確認收治動物、接診與費用。
    section
      span.help-step-icon
        UiIcon(name="locate")
      div
        h3 允許定位，查看目前位置
        p 定位成功後，地圖會移至目前座標，並將座標交給 Google 地圖顯示。位置只暫存於此頁，五分鐘後需更新。
    section
      span.help-step-icon
        UiIcon(name="route")
      div
        h3 確認地址，再開啟導航
        p 「路線導航」與地圖下方「查看路線」都會開啟 Google 地圖。已定位時帶入起點；未定位時可在 Google 選擇起點。
  .help-data-note
    UiIcon(name="info")
    p 這裡沒有即時接診資料。政府名冊提供基本資訊，夜間服務另行查閱；詳情可查看每間院所的來源與日期。
  a.help-source-link(:href="`${root}sources/`") 查看資料來源
    UiIcon(name="arrow")
</template>
