# Orange template Sass

來源：`00.template(1).zip` 中的 `00.template/`，原始檔案直接複製，未改寫內容。

| 本專案路徑 | 原始路徑 | 用途 |
| --- | --- | --- |
| `sass/` | `src/assets/sass/` | 現用 Sass 模組與頁面樣式 |
| `legacy-sass/` | `reference/legacy-sass/` | 早期 `@import` 版本留存參考 |
| `fonts/` | `src/assets/fonts/` | `_icons.sass` 使用的五種 Material Icons 字型及 Apache 2.0 授權 |

新專案可用 `@use '.../sass/mixin' as oc`、`@use '.../sass/grid' as grid`，其他 `function`、`effects`、`spacing` 也可各自引入。這些 partial 和 `src/styles/_mixin.sass` 屬於不同來源，因此保留獨立路徑。

頁面入口是 `sass/main.sass`、`sass/shared.sass`、`sass/icons-page.sass`、`sass/lab-page.sass`。它們產生樣板本身的全域樣式；在其他產品中只需要工具 mixin 時，直接 `@use` 對應 partial 即可。`legacy-sass/` 按原貌保存，適合逐項比對與日後遷移。
