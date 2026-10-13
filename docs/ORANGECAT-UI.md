# 與 orangecat-ui 一起開發

GitHub 連線目前可讀取兩個 repo；工作環境原先只含 night-hospital-map。兩個 repo 並排放置，各自維持 Git 歷史與依賴，不把完整元件庫複製到地圖 repo。

```bash
# 在兩個 repo 的共同父目錄執行，需要 orangecat-ui 的私有 repo 權限。
git clone https://github.com/orangecat-web/orangecat-ui.git
cd orangecat-ui
npm ci
npm run check
npm run test:package
```

在 Codex 開啟／附加此資料夾即可一起處理兩個 repo；VS Code 可使用「新增資料夾至工作區」。如果 GitHub 連線看不到私有 repo，先在 GitHub App 存取設定授權 orangecat-web/orangecat-ui。本次已確認有權限，不需要重新授權。

## 本次回收到元件庫

orangecat-ui 1.2.0 的 `@orangecat/ui/geolocation` 提供無 Vue 相依的單次定位工具，支援權限／HTTPS／逾時、AbortSignal 取消、有限數值座標驗證及 TypeScript 型別。地圖使用同一工具的版本化副本 `src/vendor/orangecat-ui/geolocation.js`；Vue 狀態、五分鐘有效期與院所導航留在此案。

原先 `@orangecat/vue-components` 是此案本地套件，包含搜尋、院所清單與 ContactLinks；它與獨立元件庫 `@orangecat/ui` 是不同套件，不應直接替換名稱。GPS 不需要新增 Lightbox、Menu 或其他顯示元件。

## 日後直接安裝元件庫

需要完整元件庫時先在私有庫建置打包，再在使用案安裝產生的實際檔名：

```bash
# orangecat-ui 目錄
npm ci
npm pack
# night-hospital-map 目錄（以下版本以實際打包產物為準）
npm install ../orangecat-ui/orangecat-ui-1.2.0.tgz
```

```js
import { getCurrentLocation } from '@orangecat/ui/geolocation'
```

也可用 Git dependency 鎖定已存在的 commit 或 tag，安裝期間需要私有 repo 權限；Git prepare 會建置 dist，需要 devDependencies。1.2.0 尚未建立 tag，不使用不存在的 v1.2.0 安裝網址，也不將 token 寫入 package.json。公開部署應先確認私有套件來源及散布範圍，再決定是否直接安裝。

修改通用功能時先改 orangecat-ui 的來源及測試、API 文件、版本；驗證後才更新使用案副本或套件版本。更新元件庫不會自動更新其他網站。
