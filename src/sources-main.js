// 資料來源頁入口：同一份 Sass、獨立 Vue 頁面，支援相對路徑部署。
import { createApp } from 'vue'
import SourcesApp from './SourcesApp.vue'
import './style.sass'

createApp(SourcesApp).mount('#app')
