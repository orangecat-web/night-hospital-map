<script setup>
import { nextTick, ref } from 'vue'

const props = defineProps({ url: { type: String, required: true }, label: { type: String, default: '複製查詢連結' } })
const message = ref('')
const showFallback = ref(false)
const fallbackInput = ref(null)

async function copy() {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
    await navigator.clipboard.writeText(props.url)
    showFallback.value = false
    message.value = '查詢連結已複製'
  } catch {
    showFallback.value = true
    message.value = '請選取下方連結並複製'
    await nextTick()
    fallbackInput.value?.select()
  }
}
</script>

<template lang="pug">
.oc-share-link
  button.oc-share-button(type="button" @click="copy") {{ label }}
  span.oc-share-message(role="status" aria-live="polite") {{ message }}
  input.oc-share-fallback(v-if="showFallback" ref="fallbackInput" :value="url" aria-label="可手動複製的查詢連結" readonly @focus="$event.target.select()")
</template>

<style lang="sass" scoped>
.oc-share-link
  display: flex
  flex-wrap: wrap
  align-items: center
  gap: 8px
.oc-share-button
  min-height: 40px
  padding: 7px 12px
  border: 1px solid var(--oc-accent, #0b716c)
  border-radius: 8px
  background: white
  color: var(--oc-accent-text, #095d57)
  font: inherit
  font-size: .86rem
  font-weight: 750
  cursor: pointer
.oc-share-message
  color: #31585a
  font-size: .82rem
.oc-share-message:empty
  display: none
.oc-share-fallback
  width: 100%
  min-width: 0
  padding: 8px
  border: 1px solid #c9d8d5
  border-radius: 6px
  font: inherit
  font-size: .82rem
</style>
