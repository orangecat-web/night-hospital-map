// 查詢頁入口：掛載 Vue 主畫面，載入共用 Sass。
import { createApp } from 'vue'
import App from './App.vue'
import './style.sass'

createApp(App).mount('#app')
