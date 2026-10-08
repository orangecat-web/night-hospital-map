<script setup>
// 使用相對連結，同時支援首頁、資料來源頁與子目錄部署。
defineProps({ current: { type: String, default: 'directory' } })
</script>

<template lang="pug">
header.site-header
  a.brand(:href="current === 'sources' ? '../' : './'" aria-label="夜間毛孩就醫・返回查詢首頁")
    img.brand-mark(:src="current === 'sources' ? '../favicon.svg' : './favicon.svg'" alt="" width="32" height="32")
    span 夜間毛孩就醫
  nav.site-nav(aria-label="主要導覽")
    a(:href="current === 'sources' ? '../' : './'" :aria-current="current === 'directory' ? 'page' : undefined") 查詢院所
    a(:href="current === 'sources' ? './' : './sources/'" :aria-current="current === 'sources' ? 'page' : undefined") 資料來源
  .demo-badge v1.2・公益作品
</template>
