import { DirectoryCollection } from '@orangecat/vue-components'

export class HospitalDirectory extends DirectoryCollection {
  constructor(records) {
    super(records, { searchFields: ['name', 'city', 'district', 'address'] })
  }

  search(criteria) {
    const predicates = []
    if (criteria.allDay) predicates.push((item) => item.allDay === true)
    if (criteria.emergency) predicates.push((item) => item.emergency === true)
    // openNow is intentionally not inferred from an old schedule or 24-hour label.
    return this.query({ text: criteria.keyword, city: criteria.city, district: criteria.district, predicates })
  }
}
