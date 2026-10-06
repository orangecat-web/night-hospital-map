// 將 API 設定也加入來源頁與卡片來源查詢；JSON 欄位註解見 data-schema.json。
import apiSources from './api-sources.json' with { type: 'json' }

export const checkedAt = '2026-09-30'

// 官網查閱日期與政府名冊擷取時間分開管理；來源總表放在獨立頁面。
export const sourcePolicy = {
  title: '資料來源與查核方式',
  description: '以政府 API 名冊提供院所基本資料，再合併人工查閱的夜間急診 JSON。名冊沒有夜間或即時接診欄位；整理文章與 Google 地圖搜尋僅作候選線索。',
  updatedNote: `名單最後整理：${checkedAt}。每筆院所的查閱日期見卡片；名冊擷取時間另列於查詢頁；API 更新不會重新查核夜間服務。`,
  roles: ['院所核對', '政府名冊', '候選線索'],
  roleDescriptions: {
    院所核對: '院所網站上的急診、聯絡方式與地址，是本站院所卡片的主要依據。',
    政府名冊: '用於比對院所名單與開業資訊；名冊本身不代表提供夜間急診。',
    候選線索: '整理文章與 Google 地圖搜尋可協助找院所，收錄前仍需回到院所公告核對。',
  },
  method: [
    { title: '取得政府名冊', description: '呼叫農業部開業執照 API，清洗縣市、地址、電話及開業狀態；新北來源尚未啟用。API 失敗時保留快照或人工 JSON。' },
    { title: '合併人工夜間資料', description: '比對縣市、建物地址及名稱／電話，保留官網查閱的 24 小時、急診、動物別與來源。不單靠院所名稱或電話合併分院。' },
    { title: '分開標示資料時間', description: '政府資料列出 API 擷取時間，夜間資訊保留人工查閱日；兩者都不代表已電話確認或即時接診。' },
  ],
}

export const sources = [
  ...apiSources.map((source) => ({ ...source, role: '政府名冊' })),
  { id: 'daan-official', label: '大安動物醫院・24 小時急診', url: 'https://daan-vet.com/24h/', role: '院所核對' },
  { id: 'boulderyard-official', label: '布達羊急診動物醫院官網', url: 'https://www.boulderyard24.com/', role: '院所核對' },
  { id: 'national-taipei-official', label: '全國動物醫院・台北分院', url: 'https://www.vet.com.tw/store_detail.php?Key=3', role: '院所核對' },
  { id: 'national-taichung-official', label: '全國動物醫院・台中總院', url: 'https://www.vet.com.tw/store_detail.php?Key=1', role: '院所核對' },
  { id: 'national-tainan-official', label: '全國動物醫院・台南分院', url: 'https://www.vet.com.tw/store_detail.php?Key=17', role: '院所核對' },
  { id: 'sensation-official', label: '上弦動物醫院官網', url: 'https://www.sensationah.com/', role: '院所核對' },
  { id: 'dacyun-official', label: '大群動物醫院官網', url: 'https://dacyun-vet.tw/', role: '院所核對' },
  { id: 'topvet-official', label: '太僕動物醫院官網', url: 'https://topvet.topet.net/', role: '院所核對' },
  { id: 'daan-gongguan-official', label: '大安動物醫院・公館分院官網', url: 'https://daan-gongguan.com.tw/', role: '院所核對' },
  { id: 'lele-official', label: '樂樂動物醫院・夜間急診', url: 'https://www.lelehospital.com.tw/tzjizhen.html', role: '院所核對' },
  { id: 'shunxin-official', label: '順心動物醫院官網', url: 'https://yatongvet.com/', role: '院所核對' },
  { id: 'yadong-official', label: '亞東動物醫院・夜間急診與聯絡資訊', url: 'https://vet639.url.tw/hospital.htm', role: '院所核對' },
  { id: 'genki-official', label: '元氣動物醫院・三民總院官網', url: 'https://www.genkivet.com.tw/', role: '院所核對' },
  { id: 'allweather-official', label: '全天候動物醫院官網', url: 'https://www.allweathervet.com/', role: '院所核對' },
  { id: 'zhuxin-official', label: '築心動物醫院官網', url: 'https://www.zhuxin.com.tw/', role: '院所核對' },
  { id: 'cornell-official', label: '康乃爾動物醫院・夜間急診與聯絡資訊', url: 'https://www.welovedogcat.com.tw/', role: '院所核對' },
  { id: 'chungai-official', label: '忠愛動物醫院・夜間急診時段更動', url: 'https://www.chungai.com.tw/main/View_News.aspx?NID=37&pid=', role: '院所核對' },
  { id: 'hongai-official', label: '宏愛犬貓專科醫院官網', url: 'https://www.hongai.bdb.com.tw/', role: '院所核對' },
  { id: 'lkah-official', label: '慈愛動物醫院・三家總院資訊', url: 'https://www.lkah.com.tw/news/162', role: '院所核對' },
  { id: 'hungli-official', label: '宏力動物醫院・聯絡與急診時段', url: 'https://www.hunglivet.com/contactus_1.html', role: '院所核對' },
  { id: 'mingren-official', label: '名仁動物醫院・急診與門診時間', url: 'https://www.mingren.bdb.com.tw/', role: '院所核對' },
  { id: 'national-registry', label: '農業部防檢署・獸醫診療機構開業查詢', url: 'https://ahis9.aphia.gov.tw/Veter/OD/HLIndex.aspx', role: '政府名冊' },
  { id: 'taipei-government', label: '臺北市動保處夜間急診／24 小時院所資料集', url: 'https://data.taipei/dataset/detail?id=55abae3d-57e3-4793-b68f-e4917f4e6b6a', role: '政府名冊' },
  { id: 'newtaipei-government', label: '新北市動物醫院一覽表', url: 'https://data.ntpc.gov.tw/datasets/de4cfd62-e977-4c4f-822f-7d2aa65f6e4a', role: '政府名冊' },
  { id: 'taoyuan-government', label: '桃園市動物醫院名冊', url: 'https://animal.tycg.gov.tw/News_Content.aspx?n=8559&s=873140', role: '政府名冊' },
  { id: 'dogcatstar', label: '汪喵星球・全台名單', url: 'https://www.dogcatstar.com/blog/24hour-animal-hospital/', role: '候選線索' },
  { id: 'sofydog', label: 'SofyDOG・雙北名單', url: 'https://www.sofydog.com/tw/SofyDOG/blog-detail/2025-24hr-tw/', role: '候選線索' },
  { id: 'trymore', label: '吹毛求吃・全台名單', url: 'https://www.trymore.com.tw/Article/Detail/76993?lang=zh-TW', role: '候選線索' },
  { id: 'google-search', label: 'Google 地圖・24 小時動物醫院搜尋', url: 'https://www.google.com.tw/maps/search/24%E5%B0%8F%E6%99%82%E5%8B%95%E7%89%A9%E9%86%AB%E9%99%A2/', role: '候選線索' },
]
