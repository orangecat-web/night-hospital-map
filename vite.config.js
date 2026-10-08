// 建置設定：相對資源路徑支援子目錄，兩個 HTML 入口各自產生頁面。
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "./",
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        sources: fileURLToPath(
          new URL("./sources/index.html", import.meta.url),
        ),
      },
    },
  },
  // 開發伺服器設定
  server: {
    port: 5174,
    strictPort: true, // 被占用時直接提示，避免自動換到其他 port
  },
});
