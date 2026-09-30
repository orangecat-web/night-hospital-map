export const checkedAt = '2026-09-30'

// The directory homepage links each hospital to its specific source; this
// content is rendered on the separate data-sources page.
export const sourcePolicy = {
  title: '資料來源與查核方式',
  description: '全台縣市皆可查詢，但目前僅收錄已逐筆查閱院所公告的部分院所。政府名冊可協助核對開業與名單；整理文章及 Google 地圖搜尋可作為候選線索，不能單獨證明此刻營業或收治急診。',
  updatedNote: `名單最後整理：${checkedAt}。每筆院所的查閱日期見卡片；來源頁面更新不等於本站同步更新。`,
  roles: ['院所核對', '政府名冊', '候選線索'],
  roleDescriptions: {
    院所核對: '院所網站上的急診、聯絡方式與地址，是本站院所卡片的主要依據。',
    政府名冊: '用於比對院所名單與開業資訊；名冊本身不代表提供夜間急診。',
    候選線索: '整理文章與 Google 地圖搜尋可協助找院所，收錄前仍需回到院所公告核對。',
  },
  method: [
    { title: '發現候選院所', description: '政府名冊、整理文章與 Google 地圖搜尋可提供待查名單；收錄前逐筆查閱院所官網。' },
    { title: '查閱院所官網', description: '比對院所名稱、地址、電話及官網公告的 24 小時／急診資訊。' },
    { title: '標示查閱時間', description: '保留來源連結與查閱日期。尚未逐一電話確認，也沒有即時接診資料。' },
  ],
}

export const sources = [
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
