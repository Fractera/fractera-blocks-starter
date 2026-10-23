#!/usr/bin/env node
// check:taxonomy — СТОРОЖ СЛОВАРЯ РАЗДЕЛОВ БЛОКОВ (шаг узла 577-1, стадия 1 жизненного цикла блока — README «Block lifecycle»).
//
// 🔒 Раздел — общий язык каталога: по нему блок ищут, в него кладут новый, по нему считают промахи поиска. Раздел, у которого нет
// назначения на обоих языках, или подраздел, чей родитель исчез, ломает этот язык молча — поиск просто перестаёт находить.
// Новый раздел приходит со `status: "proposed"` и становится `active` только словом владельца (решение 2026-10-23, план 577).
//
// Проверяет `registry/src/sections/taxonomy.json`:
//   types — id в kebab-case и единственный; order — целое и единственное; title и purpose — en и ru; status — active | proposed;
//           parent — существующий раздел, не сам раздел, без петли;
//   kinds — каждый вид витрины ссылается на существующий раздел.
// Отказ печатает каждое нарушение с названием раздела или вида; код выхода 1.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const FILE = join(process.cwd(), 'registry', 'src', 'sections', 'taxonomy.json')
const KEBAB = /^[a-z][a-z0-9-]{1,39}$/
const STATUS = ['active', 'proposed']
const problems = []
const has = (v) => typeof v === 'string' && v.trim().length > 0

let t
try { t = JSON.parse(readFileSync(FILE, 'utf8')) } catch (e) {
  console.error(`===TAXONOMY_FAILED=== не прочитан ${FILE}: ${e.message}`)
  process.exit(1)
}
const types = Array.isArray(t.types) ? t.types : []
if (!types.length) problems.push('types: пусто — словарь без разделов')

const ids = new Map()
const orders = new Set()
for (const type of types) {
  const name = type.id ?? '(без id)'
  if (!KEBAB.test(type.id ?? '')) problems.push(`${name}: id не в kebab-case`)
  if (ids.has(type.id)) problems.push(`${name}: id повторяется`)
  ids.set(type.id, type)
  if (!Number.isInteger(type.order)) problems.push(`${name}: order не целое число`)
  else if (orders.has(type.order)) problems.push(`${name}: order ${type.order} повторяется`)
  else orders.add(type.order)
  if (!has(type.title?.en) || !has(type.title?.ru)) problems.push(`${name}: title — нужны en и ru`)
  if (!has(type.purpose?.en) || !has(type.purpose?.ru)) problems.push(`${name}: purpose — нужны en и ru`)
  if (!STATUS.includes(type.status)) problems.push(`${name}: status «${type.status}» — active или proposed`)
}

for (const type of types) {
  if (type.parent === undefined) continue
  if (type.parent === type.id) { problems.push(`${type.id}: parent — сам раздел`); continue }
  if (!ids.has(type.parent)) { problems.push(`${type.id}: parent «${type.parent}» — такого раздела нет`); continue }
  const seen = new Set([type.id])
  for (let p = type.parent; p !== undefined; p = ids.get(p)?.parent) {
    if (seen.has(p)) { problems.push(`${type.id}: петля родителей через «${p}»`); break }
    seen.add(p)
  }
}

for (const [kind, k] of Object.entries(t.kinds ?? {})) {
  if (!ids.has(k.type)) problems.push(`вид ${kind}: раздел «${k.type}» не существует`)
}

if (problems.length) {
  console.error(`===TAXONOMY_FAILED=== ${problems.length}`)
  for (const p of problems) console.error(`  ✗ ${p}`)
  process.exit(1)
}
const active = types.filter((x) => x.status === 'active').length
console.log(`===TAXONOMY_OK=== разделов ${types.length} (действуют ${active}, предложены ${types.length - active}), видов витрины ${Object.keys(t.kinds ?? {}).length}`)
