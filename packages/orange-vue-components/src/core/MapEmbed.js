// Google Maps Embed API requires a browser-restricted key. No key means no iframe.
export class MapEmbed {
  constructor(apiKey = '') {
    this.apiKey = String(apiKey).trim()
  }

  place(query) {
    if (!this.apiKey || !String(query ?? '').trim()) return null
    const url = new URL('https://www.google.com/maps/embed/v1/place')
    url.searchParams.set('key', this.apiKey)
    url.searchParams.set('q', String(query).trim())
    url.searchParams.set('language', 'zh-TW')
    return url.toString()
  }
}
