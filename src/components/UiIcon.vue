<script setup>
// 小型介面符號共用同一筆觸；不載入外部字型或圖示服務。
import { computed } from 'vue'
const props = defineProps({ name: { type: String, default: 'paw' } })
const drawings = {
  paw: ['M8 13c-2 2-4 4-3 6s4 1 7 0c3 1 6 2 7 0s-1-4-3-6c-2-3-6-3-8 0', 'M6 8h.01M10 5h.01M15 5h.01M19 9h.01'],
  phone: ['M7 3H4a1 1 0 0 0-1 1c0 9 8 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a16 16 0 0 1-7-7l2-2-2-5Z'],
  route: ['m21 3-7 18-3-8-8-3 18-7ZM11 13l5-5'],
  map: ['m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6ZM9 3v15M15 6v15'],
  pin: ['M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z', 'M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0'],
  cross: ['M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3Z'],
  filter: ['M3 5h18l-7 8v7l-4-2v-5L3 5Z'],
  close: ['m6 6 12 12M18 6 6 18'], chevron: ['m6 9 6 6 6-6'],
  arrow: ['M4 12h16m-6-6 6 6-6 6'], back: ['M20 12H4m6-6-6 6 6 6'],
  copy: ['M9 8h11v13H9V8ZM15 8V3H4v13h5'],
  locate: ['M12 2v4M12 18v4M2 12h4M18 12h4', 'M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0', 'M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0'],
  list: ['M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'],
  info: ['M12 11v6M12 7h.01', 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0'],
}
const paths = computed(() => drawings[props.name] ?? drawings.paw)
</script>

<template lang="pug">
svg.ui-icon(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false")
  path(v-for="(path, index) in paths" :key="index" :d="path" :stroke-width="name === 'paw' && index === 1 ? 4 : undefined")
</template>
