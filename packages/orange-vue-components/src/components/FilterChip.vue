<script setup>
// 可按下或停用的篩選按鈕；狀態由父層傳入，更新透過 emit 交回父層。
defineProps({ label: { type: String, required: true }, pressed: { type: Boolean, default: false }, disabled: { type: Boolean, default: false } })
const emit = defineEmits(['update:pressed'])
</script>

<template lang="pug">
button.oc-filter-chip(type="button" :class="{ active: pressed }" :aria-pressed="pressed" :disabled="disabled" @click="emit('update:pressed', !pressed)") {{ label }}
</template>

<style lang="sass" scoped>
.oc-filter-chip
  min-height: 40px
  padding: 0 13px
  border: 1px solid var(--oc-control-border, #d5e0de)
  border-radius: 30px
  background: var(--oc-control-bg, #fff)
  color: var(--oc-control-text, #33494f)
  font: inherit
  font-size: .85rem
  font-weight: 700
  cursor: pointer
  &.active
    border-color: var(--oc-accent, #0b716c)
    background: var(--oc-accent-soft, #e7f4f0)
    color: var(--oc-accent-text, #095d57)
  &:disabled
    opacity: .52
    cursor: not-allowed
</style>
