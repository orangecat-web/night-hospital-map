# 夜間毛孩就醫 v1.2

Vue 3 + Vite 公益作品，以 Pug template 與縮排式 Sass 製作。v1.0 是使用者提供的原始 ZIP 基準；v1.1 加入免費政府 API、資料正規化、人工 JSON 合併，以及非同步載入與失敗備援。

## 這版完成了什麼

- v1.2 參照街角停車：搜尋預設收合，點「搜尋與篩選」展開；收合顯示目前條件，輸入值保留。
- 展開搜尋區獨立捲動，桌機院所結果保留捲軸；手機地圖仍以彈窗開啟。

- 農業部「獸醫師（佐）開業執照」API → 清洗縣市、地址、電話與狀態 → 合併人工夜間 JSON → Vue 搜尋／地圖。
- 預設顯示 23 間已人工查閱夜間資訊的院所，可切換「全部院所名冊」。政府名冊中的未知夜間服務不冒充急診；一次顯示 20 筆、支援分頁。
- Loading、更新名冊、錯誤訊息與重新嘗試；可沿用部署快照、本機快取或原本的人工資料。
- API 擷取時間与夜間資訊人工查閱日分開顯示，擷取超過 30 天提示需要核對。
- 保留桌機清單卷軸、手機地圖彈窗、手機資訊卡預設收起，以及可分享查詢網址。
- 主專案、API 服務、共用元件與樣式補繁中註解。JSON 維持標準格式，欄位說明集中在 `src/data/data-schema.json`。

## 啟動與更新

```bash
npm install
npm run dev
```

驗證、更新與建置：

```bash
npm run test
npm run verify:data
npm run sync:data
npm run build
npm run preview
```

`sync:data` 會呼叫官方 API，產生 `public/data/hospital-registry.json`。任一啟用來源失敗時，腳本回報失敗並保留舊快照，不寫入空名冊。這個腳本須自行在本機或 CI 執行；目前沒有雲端排程或常駐後端。

網站開啟時先顯示人工 JSON，再讀同站快照，接著呼叫政府 API。使用者按「更新名冊」可重試。API 成功會在當前瀏覽器保存公開名冊快取；不會寫回部署伺服器或更新其他人的快照。拒絕本機儲存也能使用。

## 架構與檔案

| 檔案 | 用途 |
| --- | --- |
| `src/data/hospitals.json` | 人工查閱夜間急診、官網來源、查閱日與動物別 |
| `src/data/api-sources.json` | 免費官方端點、轉換器、來源歸屬與啟用狀態 |
| `src/data/map-embeds.json` | 原有 23 間人工核對的 Google 分享 iframe |
| `src/data/data-schema.json` | JSON 欄位繁中說明，不是院所資料 |
| `src/services/registryApi.js` | timeout、JSON 檢查、分頁與多來源錯誤處理 |
| `src/services/registryNormalizer.js` | 欄位轉換、安全撥號、穩定 ID、去重與合併 |
| `src/services/HospitalRepository.js` | API／快照／快取／人工資料的切換與備援 |
| `src/composables/useHospitals.js` | Vue 非同步狀態与頁面卸載取消請求 |
| `src/domain/HospitalDirectory.js` | 夜間、全部名冊、24 小時及急診查詢規則 |
| `src/components/DataStatus.vue` | 進度、資料時間、錯誤與重試介面 |
| `scripts/sync-registry.mjs` | 從官方 API 產生可部署快照 |
| `tests/registry.test.mjs` | 合併、分院、未知服務、錯誤與備援測試 |
| `packages/orange-vue-components` | 保留跨案共用元件、網址查詢與工具 |

## 資料規則與實測

2026-10-06 實際擷取農業部 API 原始 2,078 筆，其中 2,066 筆狀態為「開業」。12 筆「補發」未推定為開業，不納入。官方資料當次涵蓋 21 縣市，没有連江縣；選單仍保留全台 22 縣市，不承諾名冊完整。

與 23 筆人工夜間資料合併與去重後，當次可查 2,067 間院所。筆數會隨 API 更新改變；這些是獸醫診療機構，不一定全是犬貓醫院，更不是 2,067 間夜間急診。

合併先要求縣市與正規化建物地址相同，再核對名稱或電話；遇到多個候選保持分開，不能只因名稱相似／共用電話合併。人工查閱的名稱、地址、服務資訊、來源、日期及原始 ID 都保留，政府資料另外放在 `registry` 對照欄位。名冊和官網有差異時應人工確認，不自動改寫已核對的地圖。

政府 API 沒有夜間急診或即時接診欄位，官方紀錄的 `allDay`、`emergency`、`openNow` 為 `null`。只有人工 JSON 的夜間公告可使 `nightVerified` 為 `true`。所有紀錄的 `openNow` 仍為 `null`，「目前營業中」維持停用。

API 的 `fetchedAt` 是成功擷取時間，**不是官方資料更新時間或人工查閱時間**。`checkedAt` 仍是原本最後查閱官網的日期；原有 23 筆未在本次升級重新逐一電話確認。

## 官方來源與授權

- 農業部資料集：https://data.gov.tw/dataset/8705
- API：https://data.moa.gov.tw/Service/OpenData/DataFileService.aspx?UnitId=078
- 說明：https://data.moa.gov.tw/open_detail.aspx?id=078
- 授權：政府資料開放授權條款－第 1 版；名冊更新頻率每半年。
- 新北參考：https://data.ntpc.gov.tw/datasets/de4cfd62-e977-4c4f-822f-7d2aa65f6e4a

新北來源在本次測試回傳 HTML，預設 `enabled: false`。保留欄位轉換與完整分頁支援；端點恢復且確認完整資料後才可啟用，不能把 HTML／部分預覽當成成功結果。網站會實際呼叫已啟用的農業部 API；若網域、CORS、防火牆或網路限制導致失敗，沿用現有資料並顯示錯誤。

## 地圖與附近院所

既有 23 間沿用 Google「分享 → 嵌入地圖」iframe，無須 API key。政府新增紀錄沒有人工核對的分享嵌圖時，顯示地址及外開 Google 地圖／導航連結。沒有批次地理編碼，也不使用行政區中心點冒充院所位置。

`.env.example` 保留既有選用的 Maps Embed API key 備援，但這版不需要啟用，不使用付費 Google Places API。

附近院所仍暫緩：先補齊已核對的經緯度與來源，再評估 5 公里內覆盖率。5 公里是優先展示目標，沒有結果時仍應保留更遠院所；直線距離須明示，不能當成行車距離。

## 部署與版本

ZIP 包含完整原始碼、共用套件與建置後的 `dist/`，不附 `node_modules` 或本機 `.git`。放回自己的工作目錄時保留原本 `.git`，由自己提交與推送。

部署到 `/night-hospital-map/` 時，把 `dist/` 裡的內容上傳到該目錄，`index.html`、`assets/`、`data/`、`sources/` 同層。Vite 使用 `base: './'`，首頁與資料來源頁均支援子目錄。

版本規則：新功能增加次版號（v1.1、v1.2），修錯增加修訂版號（v1.1.1）；變更紀錄見 `CHANGELOG.md`，逐檔資料流導讀見 `docs/API-GUIDE.md`。此版為前端實際串接外部 API 的作品，尚無自建資料庫、後端服務或雲端排程。
