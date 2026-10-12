# GPS 工具來源

`geolocation.js` 與 `orangecat-web/orangecat-ui` 1.2.0 的 `src/utils/geolocation.js` 相同，是本次新寫的共用工具副本。

- 上游： https://github.com/orangecat-web/orangecat-ui
- 上游 commit：`d71bba2`（1.2.0 單次定位工具）。
- API：`getCurrentLocation`、`GeolocationError`、`isGeoCoordinates`。
- 上游只處理定位與取消；Vue 狀態、有效期、文案、院所及 Google 地圖網址由此案管理。
- 使用版本化副本，避免公開站點安裝時要求私有 repo 憑證或納入其他私有元件源碼。
- 升級時从上游複製此檔，確認內容一致，執行上游定位測試與此案導航測試及建置；不直接修改此副本。
- 原始碼沿用上游 UNLICENSED；本次整合由 repository 擁有者授權。
