const keys = ['q', 'city', 'district', 'allDay', 'emergency']

export class DirectoryQueryState {
  constructor({ cities = [], districts = () => [] } = {}) {
    this.cities = cities
    this.districts = districts
  }

  read(search) {
    const params = new URLSearchParams(search)
    const city = this.cities.includes(params.get('city')) ? params.get('city') : ''
    const district = city && this.districts(city).includes(params.get('district')) ? params.get('district') : ''
    return {
      keyword: (params.get('q') ?? '').slice(0, 120),
      city,
      district,
      allDay: params.get('allDay') === '1',
      emergency: params.get('emergency') === '1',
    }
  }

  url(currentUrl, state, { preserveOtherParams = true } = {}) {
    const url = new URL(currentUrl)
    if (!preserveOtherParams) url.search = ''
    else keys.forEach((key) => url.searchParams.delete(key))
    if (state.keyword?.trim()) url.searchParams.set('q', state.keyword.trim().slice(0, 120))
    if (state.city) url.searchParams.set('city', state.city)
    if (state.city && state.district) url.searchParams.set('district', state.district)
    if (state.allDay) url.searchParams.set('allDay', '1')
    if (state.emergency) url.searchParams.set('emergency', '1')
    return url
  }
}
