// 共用元件展示頁的 Vite 設定；與院所網站建置設定分開。
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({ plugins: [vue()] })
