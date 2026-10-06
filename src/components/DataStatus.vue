<script setup>
import { computed } from 'vue'

// 「擷取時間」與「官網查閱日」不同：前者只代表成功拿到名冊，不代表夜間服務重新查核。
const props = defineProps({ state: { type: Object, required: true }, loading: Boolean, label: { type: String, required: true } })
defineEmits(['refresh'])
const dates = computed(() => props.state.sourceStates.map((source) => ({ ...source, displayDate: new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', dateStyle: 'short', timeStyle: 'short' }).format(new Date(source.fetchedAt)) })))
</script>

<template lang="pug">
.data-status(:aria-busy="loading")
  .data-status-heading
    span(role="status") {{ loading ? '正在更新政府名冊…' : label }}
    button(type="button" :disabled="loading" @click="$emit('refresh')") {{ loading ? '更新中' : state.errors.length ? '重新嘗試' : '更新名冊' }}
  p(v-for="source in dates" :key="source.id") {{ source.label }}：{{ source.count }} 筆・擷取 {{ source.displayDate }}（台灣時間）
  p.data-warning(v-if="state.errors.length" role="status") 政府名冊暫時無法完整更新，先顯示現有資料。可稍後重試。
  p.data-warning(v-if="state.stale") 名冊擷取已超過 30 天，聯絡方式請再向院所核對。
  details(v-if="state.errors.length")
    summary 連線資訊
    p(v-for="error in state.errors" :key="error.id") {{ error.label }}：{{ error.message }}
</template>
