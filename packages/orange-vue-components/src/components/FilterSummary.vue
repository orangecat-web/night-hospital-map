<script setup>
// 列出已生效的篩選条件，提供逐項移除與全部清除事件。
defineProps({ filters: { type: Array, default: () => [] } })
const emit = defineEmits(['remove', 'clear'])
</script>

<template lang="pug">
.oc-filter-summary(v-if="filters.length" aria-label="目前篩選條件")
  span.oc-filter-caption 已套用
  button.oc-filter-token(v-for="filter in filters" :key="filter.key" type="button" :aria-label="`移除${filter.label}篩選`" @click="emit('remove', filter.key)") {{ filter.label }}
    span(aria-hidden="true") ×
  button.oc-filter-clear(type="button" @click="emit('clear')") 清除全部
</template>

<style lang="sass" scoped>
.oc-filter-summary
  display: flex
  flex-wrap: wrap
  align-items: center
  gap: 7px
  margin: 0 5px 14px
.oc-filter-caption
  color: #64777c
  font-size: .85rem
.oc-filter-token
  min-height: 36px
  padding: 5px 10px
  border: 1px solid #c9e2da
  border-radius: 20px
  background: #eaf6f3
  color: #095d57
  font-size: .84rem
  font-weight: 700
  span
    padding-left: 8px
    font-size: 1.1rem
    line-height: 0
.oc-filter-clear
  min-height: 36px
  padding: 5px 8px
  border: 0
  background: transparent
  color: #0a625e
  font-size: .84rem
  font-weight: 750
  text-decoration: underline
  text-underline-offset: 3px
</style>
