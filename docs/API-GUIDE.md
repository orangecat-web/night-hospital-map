# v1.1 API 與註解導讀

## 建議閱讀順序

1. `src/data/api-sources.json`：哪些來源啟用、URL 與授權是什麼。
2. `src/services/registryApi.js`：await 網路請求、逾時取消、HTTP／JSON 格式錯誤、完整分頁。
3. `src/services/registryNormalizer.js`：官方中文欄位換成元件格式，未知服務用 null，不使用猜測值。
4. `src/services/HospitalRepository.js`：快照／快取／API 的來源切換，錯誤仍保留可用資料。
5. `src/composables/useHospitals.js`：ref、shallowRef、computed 如何把非同步狀態傳給 Vue。
6. `src/App.vue`：搜尋、分頁、URL、選取院所與地圖使用同一份資料；手機 dialog 焦點返回。
7. `src/components/HospitalCard.vue`：已查閱與政府未知服務的顯示分支，沒有電話時不產生錯誤 tel:。
8. `scripts/sync-registry.mjs`：在 Node 取得名冊，失敗保留旧檔，成功才寫出可部署 JSON。
9. `tests/registry.test.mjs`：看資料污染、分院錯配、網路失敗如何被驗證。

## 資料如何流動

政府 API → fetch 與 JSON 驗證 → 官方欄位正規化 → 與人工 JSON 比對合併 → HospitalDirectory 查詢 → 20 筆卡片與選取地圖。

本站先讀部署快照，再嘗試 API；成功存本機公開資料快取，失敗顯示错误並沿用可用資料。人工院所 JSON 是本案的夜間資訊來源，不會被政府名冊更新覆蓋。API 擷取也不會修改 Google 的資料。

## 三種資料時間

- 官方來源更新頻率：農業部說明為每半年，不能因 API 成功就說來源今日更新。
- `fetchedAt`：程式成功擷取名冊時間，以 UTC 存檔，畫面轉台灣時間。
- `checkedAt`：人工查閱院所公告日期，跟 API 擷取無關。

## 怎麼擴充

新增官網查閱院所仍放 `hospitals.json`，來源放 `sources.js`，核對分享嵌圖後才放 `map-embeds.json`。政府紀錄只標為名冊院所，新增急診服務須另有來源與查閱日期。

新增免費 API 可加在 `api-sources.json`，撰寫對應 adapter，先驗證欄位與分页、授權及 CORS，再啟用。來源結構改變會失敗并保留備援；不要改成默默接受未知格式。

## 註解範圍

主專案 Vue／JavaScript、同步與驗證腳本、Vite 設定、共用套件核心工具、元件與 Sass 模組都附繁中用途說明。關鍵的非同步、合併、未知值、分頁、網址、彈窗與備援判斷有區塊註解，不逐行重述語法。

標準 JSON 不支援註解，院所、API 設定、地圖與快照維持合法 JSON；欄位說明集中在 `src/data/data-schema.json`，避免加 // 造成 JSON.parse 失敗。package-lock 與 dist 是自動產物，不手動加入註解。
