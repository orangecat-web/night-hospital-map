// 查詢頁入口：掛載 Vue 主畫面，載入共用 Sass。
import { createApp } from 'vue'
import App from './App.vue'
import './style.sass'
import './clay.sass'
import './wireframe-layout.sass'

createApp(App).mount('#app')
