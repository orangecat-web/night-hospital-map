<script setup>
// 受控搜尋輸入；使用 v-model 更新字串，不直接碰資料來源。
defineProps({ modelValue: { type: String, default: '' }, label: { type: String, default: '搜尋' }, placeholder: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
</script>

<template lang="pug">
label.oc-search-field
  span.oc-search-label {{ label }}
  input.oc-search-input(type="search" :value="modelValue" :placeholder="placeholder" autocomplete="off" @input="emit('update:modelValue', $event.target.value)")
</template>

<style lang="sass" scoped>
.oc-search-field
  display: block
  min-width: 0
.oc-search-label
  display: block
  margin-bottom: 6px
  color: var(--oc-control-label, #52666c)
  font-size: .8rem
  font-weight: 700
.oc-search-input
  width: 100%
  height: 46px
  padding: 0 12px
  border: 1px solid var(--oc-control-border, #d6e1df)
  border-radius: 9px
  background: var(--oc-control-bg, #fff)
  color: var(--oc-control-text, #183036)
  font: inherit
  font-size: 1rem
  box-sizing: border-box
  &::placeholder
    color: var(--oc-control-placeholder, #809197)
</style>
