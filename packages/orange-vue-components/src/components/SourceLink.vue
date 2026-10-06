<script setup>
// 資料來源外部連結；可選查閱日期，政府名冊沒有人工查閱日就不顯示。
defineProps({ label: { type: String, required: true }, href: { type: String, required: true }, checkedAt: { type: String, default: '' } })
</script>

<template lang="pug">
a.oc-source-link(:href="href" target="_blank" rel="noopener noreferrer") {{ label }}
  span(v-if="checkedAt") 　·　查閱 {{ checkedAt }}
</template>

<style lang="sass" scoped>
.oc-source-link
  color: var(--oc-accent, #0b716c)
  font-size: .8rem
  font-weight: 700
  line-height: 1.5
  text-underline-offset: 3px
  span
    color: var(--oc-control-label, #64777c)
    font-weight: 400
</style>
