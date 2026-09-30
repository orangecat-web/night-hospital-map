import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DirectoryCollection } from '../packages/orange-vue-components/src/core/DirectoryCollection.js'
import { ContactLinks } from '../packages/orange-vue-components/src/core/ContactLinks.js'
import { taiwanCities } from '../src/data/regions.js'
import { sources } from '../src/data/sources.js'

const hospitals = JSON.parse(readFileSync(new URL('../src/data/hospitals.json', import.meta.url), 'utf8'))
const mapEmbeds = JSON.parse(readFileSync(new URL('../src/data/map-embeds.json', import.meta.url), 'utf8'))
const sourceIds = new Set(sources.map((source) => source.id))
assert.equal(taiwanCities.length, 22, 'The region picker must cover all 22 counties and cities')
assert.equal(new Set(taiwanCities).size, 22, 'Duplicate city')
assert.equal(sourceIds.size, sources.length, 'Duplicate source ID')
assert.equal(new Set(hospitals.map((item) => item.id)).size, hospitals.length, 'Duplicate hospital ID')
assert.deepEqual(Object.keys(mapEmbeds).sort(), hospitals.map((item) => item.id).sort(), 'Map embeds must match hospital IDs')
assert.equal(new Set(Object.values(mapEmbeds)).size, hospitals.length, 'Duplicate map embed URL')

for (const hospital of hospitals) {
  assert.ok(hospital.name && hospital.address && hospital.phone, `${hospital.id}: missing contact data`)
  assert.ok(taiwanCities.includes(hospital.city), `${hospital.id}: unknown city`)
  assert.ok(hospital.address.startsWith(hospital.city), `${hospital.id}: address and city mismatch`)
  assert.ok(sourceIds.has(hospital.sourceId), `${hospital.id}: missing source`)
  assert.match(hospital.checkedAt, /^20\d{2}-\d{2}-\d{2}$/, `${hospital.id}: missing review date`)
  assert.equal(typeof hospital.allDay, 'boolean', `${hospital.id}: missing 24-hour emergency classification`)
  assert.equal(hospital.openNow, null, `${hospital.id}: live status must not be invented`)
  assert.match(ContactLinks.phone(hospital.phone), /^tel:[+0-9]+$/)
  assert.match(ContactLinks.directions(hospital.address), /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=/)
  assert.match(mapEmbeds[hospital.id], /^https:\/\/www\.google\.com\/maps\/embed\?pb=/, `${hospital.id}: missing Google Maps share embed`)
}

const directory = new DirectoryCollection(hospitals, { searchFields: ['name', 'city', 'district', 'address'] })
assert.equal(directory.query({ city: '新北市', district: '林口區' }).length, 1)
assert.equal(directory.query({ text: '全國動物醫院' }).length, 3)
assert.equal(directory.query({ text: '不存在的院所' }).length, 0)
assert.equal(directory.query({ city: '桃園市' }).length, 1)
assert.equal(directory.query({ city: '新竹市' }).length, 3)
assert.equal(directory.query({ city: '屏東縣' }).length, 1)
assert.equal(directory.query({ text: '名仁', predicates: [(item) => item.allDay] }).length, 0)
assert.equal(directory.query({ city: '高雄市' }).length, 2)
assert.equal(directory.query({ city: '臺中市' }).length, 3)
assert.equal(directory.query({ city: '臺東縣' }).length, 0, 'No verified record should appear in an unreviewed county')
assert.equal(directory.query({ city: '彰化縣', predicates: [(item) => item.allDay] }).length, 0, 'Night clinic is not 24-hour intake')
assert.equal(directory.query({ text: '樂樂', predicates: [(item) => item.allDay === true] }).length, 0)

console.log(`Verified ${hospitals.length} sourced hospital samples and filter/link behavior.`)
