# v1.1 驗證紀錄

- 2026-10-06 實际呼叫農業部 API，成功取得 JSON；回應包含 Access-Control-Allow-Origin: *。
- 實際執行 npm run sync:data，取得原始 2,078 筆、正規化後 2,066 筆。
- npm run test：13 項資料、合併、錯誤、快取、分頁與取消測試通過。
- npm run verify:data：23 筆原有人工 JSON 與分享嵌圖的連結／篩選驗證通過。
- npm run build：Vite 正式建置通過，包含首頁與 sources 頁面。
- 新北 API 在本次測試回傳 HTML，未启用、不宣稱實際完成介接。

API 可以更新院所名冊，但不會自動重查急診班表，不提供即時接診，也沒有自建後端或資料庫。

瀏覽器視覺驗證限制：本環境沒有 Chromium 執行檔，Playwright 自動下載與替代下載皆被網站存取限制阻擋。本版尚未完成實際瀏覽器的桌機／手機視覺與操作驗證，請本機 npm run dev 後確認查詢範圍、分頁、手機地圖彈窗與資訊收合。
