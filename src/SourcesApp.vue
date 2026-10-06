<script setup>
import apiSources from './data/api-sources.json'
import SiteHeader from './components/SiteHeader.vue'
import { checkedAt, sourcePolicy, sources } from './data/sources'

// 按用途分組，讓訪客區分院所公告、政府名冊與待核對線索。
const groups = sourcePolicy.roles.map((role) => ({
  role,
  description: sourcePolicy.roleDescriptions[role],
  items: sources.filter((item) => item.role === role),
}))
</script>

<template lang="pug">
.site-shell
  SiteHeader(current="sources")
  main.sources-page
    .sources-hero
      a.back-link(href="../") 返回院所查詢
      .sources-intro
        div
          span.page-kicker 資料透明
          h1 {{ sourcePolicy.title }}
          p {{ sourcePolicy.description }}
        .sources-aside(role="note")
          strong 先致電，再出發
          span 本站沒有即時接診狀態；假日、滿診、收治動物別及收費，請以院所當下回覆為準。

    .sources-content
      section.method-section(aria-labelledby="api-title")
        .section-heading
          h2#api-title 政府資料介接
          span v1.1
        ul.api-source-list
          li(v-for="source in apiSources" :key="source.id")
            strong {{ source.label }}・{{ source.enabled ? '已啟用' : '尚未啟用' }}
            p {{ source.note }}
            p 授權：{{ source.license }}・來源更新頻率：{{ source.updateFrequency }}
        p API 擷取只更新名冊，不會自動重新查核夜間時段或 Google 地圖分享連結。
      section.method-section(aria-labelledby="method-title")
        .section-heading
          h2#method-title 本站如何整理資料
          span 查閱日期 {{ checkedAt }}
        ol.method-list
          li(v-for="(step, index) in sourcePolicy.method" :key="step.title")
            span.method-number {{ String(index + 1).padStart(2, '0') }}
            strong {{ step.title }}
            p {{ step.description }}

      section.source-directory(aria-labelledby="source-list-title")
        .section-heading
          h2#source-list-title 參考來源
          span 依用途區分
        .source-groups
          section.source-group(v-for="group in groups" :key="group.role" :aria-label="group.role")
            .group-heading
              h3 {{ group.role }}
              span {{ group.items.length }} 項
            p {{ group.description }}
            ul
              li(v-for="item in group.items" :key="item.id")
                a(:href="item.url" target="_blank" rel="noopener noreferrer") {{ item.label }}
                  span(aria-hidden="true") ↗
        p.source-update {{ sourcePolicy.updatedNote }}
      a.bottom-return(href="../") 返回院所查詢
</template>
