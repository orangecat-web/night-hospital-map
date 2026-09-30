<script setup>
defineProps({ label: { type: String, required: true } })
</script>

<template lang="pug">
details.oc-detail-disclosure
  summary {{ label }}
  .oc-detail-content
    slot
</template>

<style lang="sass" scoped>
.oc-detail-disclosure
  border-top: 1px solid #edf1f0
  summary
    padding: 13px 16px
    color: var(--oc-accent-text, #095d57)
    font-size: .9rem
    font-weight: 750
    cursor: pointer
    list-style-position: inside
  summary:focus-visible
    outline: 3px solid #78c7be
    outline-offset: -3px
.oc-detail-content
  padding: 0 16px 16px
  color: #425d62
  font-size: .9rem
  line-height: 1.6
</style>
