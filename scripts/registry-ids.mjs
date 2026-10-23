#!/usr/bin/env node
// АДРЕСА ПОДСВЕТКИ В КОДЕ БЛОКОВ РЕЕСТРА (шаг узла 577-4, стадия 3 жизненного цикла блока — README «Block lifecycle»).
//
// 🔒 ЗАЧЕМ. Подсветка вкладки «Живой сайт» элемента видит только `[data-block]` (навык элемента `use-highlight`): человек наводит
// на контейнер, копирует адрес и даёт агенту точную задачу. Блок страницы получает адрес целиком от `bid` данных (обёртка
// `page-body`), а контейнеры ВНУТРИ блока — только из кода. Сторож элемента `stamp-widget-ids` обходит виджеты, инструменты и их
// импорты — блок каталога, названный страницей данными, в его зону не входит. ✗ Замер 2026-10-23: в 18 файлах блоков реестра — ноль
// `data-block`; внутри ни одного блока каталога подсветка не видела ни одного контейнера. Владелец 2026-10-23: «проверь что … все
// блоки … имеют правильную подсветку для каждого контейнера … когда возникает необходимость создать новый блок … в соответствии с
// навыком … добавлять специальные идентификаторы в код».
// 🔒 ПОЭТОМУ АДРЕС СТАВИТСЯ У ИСТОЧНИКА: каждый контейнер каждого блока `registry/src/components/blocks/*.tsx` (и файла, который блок
// импортирует из `registry/src/components/`, кроме библиотек `ui`, `ai-elements`, `dialog`) несёт `data-block`, и элемент получает его
// вместе с блоком. Без `--fix` — сторож в `prebuild`: блок с контейнером без адреса не выпускается.
// 🔒 СПИСОК КОНТЕЙНЕРОВ ОДИН: он читается из `scripts/stamp-widget-ids.mjs` этого элемента (`const CONTAINERS = new Set([…])`), а не
// пишется второй раз — две копии разошлись бы молча.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, sep, dirname } from 'node:path'
import { randomBytes } from 'node:crypto'
import ts from 'typescript'

const ROOT = process.cwd()
const FIX = process.argv.includes('--fix')
const SRC = join(ROOT, 'registry', 'src')
const BLOCKS = join(SRC, 'components', 'blocks')
const rel = (p) => relative(ROOT, p).split(sep).join('/')

const stamper = readFileSync(join(ROOT, 'scripts', 'stamp-widget-ids.mjs'), 'utf8')
const setText = stamper.match(/const CONTAINERS = new Set\(\[([\s\S]*?)\]\)/)?.[1]
if (!setText) { console.error('===REGISTRY_IDS_FAILED=== the list CONTAINERS was not found in scripts/stamp-widget-ids.mjs'); process.exit(1) }
const CONTAINERS = new Set([...setText.replace(/\/\/[^\n]*/g, '').matchAll(/'([A-Za-z0-9]+)'/g)].map((m) => m[1]))

function files(dir, ext, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) files(p, ext, out)
    else if (name.endsWith(ext)) out.push(p)
  }
  return out
}

// What is checked: EVERY file of EVERY block of the registry, wherever it lies (owner 2026-10-23: «без каких-либо ограничений это
// распространяется на блоке и все их контейнеры» — block-dialog-sample lies in components/dialog and is a block all the same), every
// file in components/blocks, and every registry component a block imports (not the libraries ui, ai-elements, dialog: a library
// passes props, and the block that calls it gives the address).
const LIBRARY = ['ui', 'ai-elements', 'dialog'].map((d) => join(SRC, 'components', d) + sep)
const targets = new Set()
const follow = (file, own = false) => {
  if (targets.has(file)) return
  if (!own && LIBRARY.some((l) => file.startsWith(l))) return
  targets.add(file)
  for (const m of readFileSync(file, 'utf8').matchAll(/from\s+['"]@\/components\/([^'"]+)['"]/g)) {
    const base = join(SRC, 'components', m[1])
    const hit = [`${base}.tsx`, join(base, 'index.tsx')].find((c) => existsSync(c))
    if (hit) follow(hit)
  }
}
const registry = JSON.parse(readFileSync(join(ROOT, 'registry.json'), 'utf8'))
for (const item of registry.items.filter((i) => i.name.startsWith('block-'))) {
  for (const f of item.files ?? []) if (f.path.endsWith('.tsx')) follow(join(ROOT, f.path), true)
}
for (const f of files(BLOCKS, '.tsx')) follow(f, true)

// Taken addresses: in the registry and in this element's own code — a new one never repeats an existing one.
const taken = new Set()
for (const root of [SRC, join(ROOT, 'components'), join(ROOT, 'app'), join(ROOT, '_tools')]) for (const f of files(root, '.tsx')) for (const m of readFileSync(f, 'utf8').matchAll(/data-block="([a-z0-9]+)"/g)) taken.add(m[1])
function newId() {
  const a = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (;;) {
    const b = randomBytes(5)
    let id = a[b[0] % 26]
    for (let i = 1; i < 5; i++) id += a[b[i] % 36]
    if (!taken.has(id)) { taken.add(id); return id }
  }
}

const missing = []
let stamped = 0
for (const file of [...targets].sort()) {
  const text = readFileSync(file, 'utf8')
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const spots = []
  const visit = (node) => {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && ts.isIdentifier(node.tagName) && CONTAINERS.has(node.tagName.text)) {
      const has = node.attributes.properties.some((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === 'data-block')
      if (!has) {
        const { line } = sf.getLineAndCharacterOfPosition(node.tagName.getStart(sf))
        spots.push({ at: node.tagName.end, where: `${rel(file)}:${line + 1} <${node.tagName.text}>` })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  if (!spots.length) continue
  if (!FIX) { missing.push(...spots.map((s) => s.where)); continue }
  let out = text
  for (const s of spots.sort((x, y) => y.at - x.at)) out = `${out.slice(0, s.at)} data-block="${newId()}"${out.slice(s.at)}`
  writeFileSync(file, out)
  stamped += spots.length
  console.log(`  ${rel(file)}: +${spots.length}`)
}

if (missing.length) {
  for (const m of missing) console.error(`  ${m}`)
  console.error(`===REGISTRY_IDS_FAILED=== containers of registry blocks without a highlight address: ${missing.length}. Stamp them: npm run registry:ids`)
  process.exit(1)
}
console.log(`===REGISTRY_IDS_OK===${stamped ? ` stamped: ${stamped}` : ''} every container of the registry blocks has data-block (${targets.size} files)`)
