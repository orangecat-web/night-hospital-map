import { DirectoryCollection } from '../../packages/orange-vue-components/src/core/DirectoryCollection.js'

export class HospitalDirectory extends DirectoryCollection {
  // 既有共用清單负责文字、縣市、行政區比對；此案只擴充院所業務規則。
  constructor(records) {
    super(records, { searchFields: ['name', 'city', 'district', 'address'] })
  }

  search(criteria) {
    const predicates = []
    // 預設只顯示人工查閱的夜間院所；「全部名冊」才會包含夜間資訊未知的院所。
    if (criteria.scope !== 'all') predicates.push((item) => item.nightVerified === true)
    if (criteria.allDay) predicates.push((item) => item.allDay === true)
    if (criteria.emergency) predicates.push((item) => item.emergency === true)
    // 開業執照、舊班表、24 小時標籤都不能推算「此刻接診」。
    return this.query({ text: criteria.keyword, city: criteria.city, district: criteria.district, predicates })
  }
}
