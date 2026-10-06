<script setup>
// 縣市、行政區連動；換縣市先清空舊行政區，避免無法配對的條件。
defineProps({ city: { type: String, default: '' }, district: { type: String, default: '' }, cities: { type: Array, default: () => [] }, districts: { type: Array, default: () => [] } })
const emit = defineEmits(['update:city', 'update:district'])
function setCity(value) {
  emit('update:city', value)
  emit('update:district', '')
}
</script>

<template lang="pug">
.oc-region-picker
  label.oc-region-field
    span.oc-region-label 縣市
    select(:value="city" aria-label="選擇縣市" @change="setCity($event.target.value)")
      option(value="") 全部縣市
      option(v-for="item in cities" :key="item" :value="item") {{ item }}
  label.oc-region-field
    span.oc-region-label 行政區
    select(:value="district" :disabled="!city" aria-label="選擇行政區" @change="emit('update:district', $event.target.value)")
      option(value="") 全部行政區
      option(v-for="item in districts" :key="item" :value="item") {{ item }}
</template>

<style lang="sass" scoped>
.oc-region-picker
  display: grid
  grid-template-columns: repeat(2, minmax(0, 1fr))
  gap: 10px
.oc-region-field
  min-width: 0
.oc-region-label
  display: block
  margin-bottom: 6px
  color: var(--oc-control-label, #52666c)
  font-size: .8rem
  font-weight: 700
select
  width: 100%
  min-width: 0
  height: 46px
  padding: 0 12px
  border: 1px solid var(--oc-control-border, #d6e1df)
  border-radius: 9px
  background: var(--oc-control-bg, #fff)
  color: var(--oc-control-text, #183036)
  font: inherit
  font-size: 1rem
  box-sizing: border-box
  &:disabled
    color: #89999d
    background: #f4f6f6
    cursor: not-allowed
</style>
