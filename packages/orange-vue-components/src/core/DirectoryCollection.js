export class DirectoryCollection {
  constructor(records, { searchFields = ['name'], cityField = 'city', districtField = 'district' } = {}) {
    this.records = Object.freeze(records.map((record) => Object.freeze({ ...record })))
    this.searchFields = searchFields
    this.cityField = cityField
    this.districtField = districtField
  }

  cities() {
    return [...new Set(this.records.map((item) => item[this.cityField]).filter(Boolean))]
  }

  districts(city) {
    return [...new Set(this.records.filter((item) => item[this.cityField] === city).map((item) => item[this.districtField]).filter(Boolean))]
  }

  find(id) {
    return this.records.find((item) => item.id === id) ?? null
  }

  query({ text = '', city = '', district = '', predicates = [] } = {}) {
    const needle = text.trim().toLocaleLowerCase('zh-Hant')
    return this.records.filter((item) => {
      if (city && item[this.cityField] !== city) return false
      if (district && item[this.districtField] !== district) return false
      if (needle && !this.searchFields.some((field) => String(item[field] ?? '').toLocaleLowerCase('zh-Hant').includes(needle))) return false
      return predicates.every((predicate) => predicate(item))
    })
  }
}
