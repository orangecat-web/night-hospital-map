# OrangeCat Vue Components

獨立的 Vue 3 元件專案，沿用 Pug template、縮排式 Sass、`@use` / `@forward` 的拆分方式。

## 收錄內容

- `SearchField`、`RegionPicker`、`FilterChip`、`FilterSummary`、`SourceLink`：不綁定動物醫院資料的介面元件。
- `DetailDisclosure`：可放入各專案欄位的鍵盤可操作詳情區。
- `VerificationNotice`、`SourceFreshness`：顯示來源查閱日、電話確認狀態與超過指定天數的待查核提示。預設 90 天僅為本站的複查提醒門檻，並非資料有效期限。
- `DirectoryQueryState`、`ShareLinkButton`：把查詢條件寫成可分享網址，並提供複製連結與手動複製備援。
- `DistanceDirectory`：純粹的直線距離計算；僅在所有結果都有已核對座標時才允許排序。使用者定位權限與座標來源由應用專案管理。
- `DirectoryCollection`：物件導向的清單搜尋與地區選項。
- `ContactLinks`：電話與 Google Maps URL 組裝；呼叫方需先確認資料可信。
- `MapEmbed`：以已設定的 Google Maps Embed API key 組合地圖預覽網址；未設定時回傳 `null`。
- `src/styles`：Sass tokens 與 mixin，供其他專案 `@use`。
- `src/styles/orange-template`：從 `00.template(1).zip` 收回的 Sass 原稿、圖示字型與授權檔。新版 Sass 模組和舊版參考稿分開存放。

## 在 Vue 3 + Vite 專案中使用

這個資料夾本身也是一個可獨立開啟的 Vite 專案：`npm install`、`npm run dev` 可查看 `playground/`。`npm run build` 可確認元件能編譯。

將此專案放在消費端專案的 `packages/orange-vue-components`，並於消費端 `package.json` 加上：

```json
"@orangecat/vue-components": "file:packages/orange-vue-components"
```

執行 `npm install` 後：

```js
import { SearchField, FilterChip, DirectoryCollection } from '@orangecat/vue-components'
```

Sass：`@use '../packages/orange-vue-components/src/styles' as oc`。

## 使用原本的 Sass

`src/styles/orange-template/sass/` 保留樣板中實際使用的縮排式 Sass（含 `_mixin.sass`、`_grid.sass`、`_function.sass`、`_spacing.sass` 等），`legacy-sass/` 保留較早期的 `@import` 原稿。這兩組檔案與現有 `src/styles` 共存，沒有改寫原稿或覆蓋既有同名檔案。

在同一個工作區的消費端專案，可依各模組的用途引入：

```sass
@use '../packages/orange-vue-components/src/styles/orange-template/sass/mixin' as oc
@use '../packages/orange-vue-components/src/styles/orange-template/sass/grid' as grid

.card
  @include oc.radius(2)
  @include grid.breakpoint(xs)
    width: 100%
```

整頁樣式可引入 `sass/main.sass`、`sass/shared.sass`、`sass/icons-page.sass` 或 `sass/lab-page.sass`。圖示字型放在相對路徑 `fonts/`，隨包附有原始授權檔；頁面樣式會依原稿產生全域 CSS，請按需載入。更多檔案與來源對照見 [Sass 說明](src/styles/orange-template/README.md)。

各元件使用 `--oc-*` CSS 變數調色；業務資料與院所規則留在各專案的 `domain/`。要擴充新案子時，先加通用元件／工具，再在應用層組合。這是一個獨立 npm 專案；未發布到 npm，也不含醫院名單。
