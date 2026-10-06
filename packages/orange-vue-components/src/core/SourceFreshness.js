// 計算人工查閱日至今的天數；過期提示不代表重新查核過服務。
export class SourceFreshness {
  constructor(checkedAt, staleAfterDays = 90) {
    this.checkedAt = checkedAt
    this.staleAfterDays = staleAfterDays
  }

  get daysSince() {
    const checked = Date.parse(`${this.checkedAt}T00:00:00Z`)
    if (!Number.isFinite(checked)) return null
    const today = new Date()
    const midnight = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    return Math.max(0, Math.floor((midnight - checked) / 86400000))
  }

  get needsReview() {
    return this.daysSince === null || this.daysSince > this.staleAfterDays
  }
}
