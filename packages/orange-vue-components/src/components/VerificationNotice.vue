<script setup>
import { computed } from 'vue'
import { SourceFreshness } from '../core/SourceFreshness.js'

const props = defineProps({
  checkedAt: { type: String, required: true },
  sourceLabel: { type: String, default: '來源頁面' },
  confirmedByPhone: { type: Boolean, default: false },
  staleAfterDays: { type: Number, default: 90 },
})
const freshness = computed(() => new SourceFreshness(props.checkedAt, props.staleAfterDays))
</script>

<template lang="pug">
.oc-verification-notice(:class="{ 'needs-review': freshness.needsReview }" role="note")
  strong {{ freshness.needsReview ? '資料待重新查核' : '資料查核狀態' }}
  p {{ sourceLabel }}查閱日：{{ checkedAt }}。{{ confirmedByPhone ? '已電話確認當時資訊；今日接診仍需再確認。' : '尚未逐一致電確認；今日是否接診、收治動物與費用請直接詢問院所。' }}
  p(v-if="freshness.needsReview") 距上次查閱已超過 {{ staleAfterDays }} 天，請以院所最新公告與電話回覆為準。
</template>

<style lang="sass" scoped>
.oc-verification-notice
  padding: 12px 13px
  border-radius: 8px
  background: #f2f7f6
  color: #31585a
  font-size: .86rem
  line-height: 1.55
  &.needs-review
    background: #fff4e9
    color: #764c25
  strong
    font-size: .88rem
  p
    margin: 4px 0 0
</style>
