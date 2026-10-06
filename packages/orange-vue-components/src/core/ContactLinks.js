// 建立電話、地圖搜尋與導航網址；文字透過 URL 編碼，非即時資料介接。
export class ContactLinks {
  static phone(number) {
    const digits = String(number ?? '').replace(/[^0-9+]/g, '')
    return digits ? `tel:${digits}` : null
  }

  static directions(address) {
    return address ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}` : null
  }

  static search(address) {
    return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null
  }
}
