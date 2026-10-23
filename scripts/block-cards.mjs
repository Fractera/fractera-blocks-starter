#!/usr/bin/env node
// CARDS OF THE BLOCKS — stage 2 of the block lifecycle (node step 577-2; README «Block lifecycle»).
//
//   node scripts/block-cards.mjs --write   cards → registry.json (categories, docs, meta, the card file in the item) and the showcase module
//   node scripts/block-cards.mjs --check   prebuild: every block has a full card, registry.json and the showcase module are fresh,
//                                          every case and variant renders on the server without an error
//
// 🔒 THE CARD FILE IS THE SOURCE, next to the block's code: `<component path without .tsx/.client.tsx>.card.json`. registry.json and
// `app/showcase/_data/published-blocks.generated.ts` are GENERATED from the cards (law: a block without a card does not reach the
// showcase — the catalogue is generated from the folder, not written by hand). A hand edit of their card fields is lost on --write
// and refused by --check.
// 🔒 The card answers the questions of CHOICE: where the block stands, when to take it and when not, its cases, its limits. The
// placement formulas are the owner's (2026-10-23): standalone · standalone and inside X · only inside X.
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const REGISTRY = join(ROOT, 'registry.json')
const TAXONOMY = join(ROOT, 'registry', 'src', 'sections', 'taxonomy.json')
const SHOWCASE = join(ROOT, 'app', 'showcase', '_data', 'published-blocks.generated.ts')
const mode = process.argv.includes('--write') ? 'write' : process.argv.includes('--check') ? 'check' : null
if (!mode) { console.error('block-cards: --write or --check'); process.exit(1) }

const ROLES = ['opener', 'body', 'closer', 'any']
const MODES = ['persuade', 'operate', 'read']
const REPEAT = ['once', 'not-adjacent', 'free']
const INTERACTIVE = ['none', 'island']
const MEDIA = ['none', 'optional', 'required']
const WEIGHT = ['light', 'medium', 'heavy']
const STATUS = ['published', 'deprecated']
const HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
const KEBAB = /^[a-z][a-z0-9-]{1,39}$/
const SEMVER = /^\d+\.\d+\.\d+$/
const CARD_LIMIT = 6 * 1024 // bytes of a card without its cases: `show` stays cheap however the catalogue grows
const NOT_META = new Set(['name', 'categories', 'docs'])

const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'))
const text = readFileSync(REGISTRY, 'utf8')
const EOL = text.includes('\r\n') ? '\r\n' : '\n'
const registry = JSON.parse(text)
const taxonomy = readJson(TAXONOMY)
const sections = new Map(taxonomy.types.map((t) => [t.id, t]))
const blocks = registry.items.filter((i) => i.name.startsWith('block-'))
const problems = []
const debts = []
const fail = (block, msg) => problems.push(`${block}: ${msg}`)

/** The card next to the block's first file: registry/src/components/blocks/block-x.tsx → …/block-x.card.json */
const cardPathOf = (item) => item.files?.[0]?.path?.replace(/(\.client)?\.tsx?$/, '.card.json')
const cardTargetOf = (item) => item.files?.[0]?.target?.replace(/(\.client)?\.tsx?$/, '.card.json')

const cards = new Map()
for (const item of blocks) {
  const rel = cardPathOf(item)
  if (!rel || !existsSync(join(ROOT, rel))) { fail(item.name, `no card at ${rel}`); continue }
  try { cards.set(item.name, { item, rel, card: readJson(join(ROOT, rel)) }) } catch (e) { fail(item.name, `card is not JSON: ${e.message}`) }
}

// ── the card itself ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const str = (v, min, max) => typeof v === 'string' && v.trim().length >= min && v.trim().length <= max
for (const [name, { card }] of cards) {
  if (card.name !== name) fail(name, `card.name is «${card.name}»`)
  if (!str(card.component, 2, 60)) fail(name, 'component: the exported name of the block')
  if (typeof card.pageKind !== 'boolean') fail(name, 'pageKind: true when a page sequence may name the block')
  if (!Array.isArray(card.categories) || !card.categories.length) fail(name, 'categories: at least one section')
  for (const c of card.categories ?? []) {
    const s = sections.get(c)
    if (!s) fail(name, `categories: «${c}» is not a section of taxonomy.json`)
    else if (s.status !== 'active') fail(name, `categories: section «${c}» is ${s.status}`)
  }
  if (!ROLES.includes(card.role)) fail(name, `role: one of ${ROLES.join(', ')}`)
  const p = card.placement
  if (!p || typeof p.page !== 'boolean' || !Array.isArray(p.inside)) fail(name, 'placement: { page: boolean, inside: [blocks] }')
  if (p && !p.page && !p.inside.length && card.pageKind) fail(name, 'placement: a page kind that may stand nowhere')
  if (p && p.via !== undefined && !['children', 'props'].includes(p.via)) fail(name, 'placement.via: children or props')
  if (card.accepts !== null && !Array.isArray(card.accepts)) fail(name, 'accepts: null, or the blocks a container takes (or "text", "any")')
  if (!REPEAT.includes(card.repeat)) fail(name, `repeat: one of ${REPEAT.join(', ')}`)
  if (!Array.isArray(card.mode) || !card.mode.length || card.mode.some((m) => !MODES.includes(m))) fail(name, `mode: some of ${MODES.join(', ')}`)
  if (!str(card.use, 20, 300)) fail(name, 'use: when to take the block, one sentence (20–300 characters)')
  if (!str(card.avoid, 10, 300)) fail(name, 'avoid: when not to, one sentence')
  if (typeof card.slots !== 'object' || card.slots === null || Array.isArray(card.slots)) fail(name, 'slots: an object (limits of the data)')
  if (!str(card.props, 5, 2000)) fail(name, 'props: the data shape as a TypeScript type')
  if (card.pageKind && !card.props.includes(`kind: '${name}'`)) fail(name, `props: a page kind names itself — kind: '${name}'`)
  if (card.pageKind && !(typeof card.markdown === 'string' && card.markdown.startsWith(`case '${name}':`))) fail(name, `markdown: a page kind brings its machine-copy case — case '${name}':`)
  if (!card.pageKind && card.markdown !== null) fail(name, 'markdown: null for a block that is not a page kind')
  if (!Array.isArray(card.variants)) fail(name, 'variants: an array')
  if (card.data !== 'static' && !(card.data && typeof card.data.door === 'string')) fail(name, 'data: "static" or { door, schema }')
  if (!Array.isArray(card.requires) || card.requires.some((r) => !KEBAB.test(r))) fail(name, 'requires: element ids')
  if (!INTERACTIVE.includes(card.interactive)) fail(name, `interactive: one of ${INTERACTIVE.join(', ')}`)
  if (!MEDIA.includes(card.media)) fail(name, `media: one of ${MEDIA.join(', ')}`)
  if (!Array.isArray(card.headings) || card.headings.some((h) => !HEADINGS.includes(h))) fail(name, 'headings: the levels the block prints')
  if (!['tested', 'untested'].includes(card.rtl)) fail(name, 'rtl: tested or untested')
  if (card.rtl === 'untested') debts.push(name)
  if (!WEIGHT.includes(card.weight)) fail(name, `weight: one of ${WEIGHT.join(', ')}`)
  if (typeof card.band !== 'boolean') fail(name, 'band: does the block paint its own background band')
  if (!Array.isArray(card.alternatives)) fail(name, 'alternatives: an array of blocks')
  if (!card.source || !['own', 'vendor'].includes(card.source.origin) || !str(card.source.license, 2, 40)) fail(name, 'source: { origin: own|vendor, license }')
  if (!card.origin || !KEBAB.test(card.origin.project ?? '') || !(card.origin.request === null || /^req-\d{8}-[a-z0-9]{6}$/.test(card.origin.request))) fail(name, 'origin: { project, request } — the project and the request it was born from')
  if (!SEMVER.test(card.version ?? '')) fail(name, 'version: x.y.z (a change of props is a new major)')
  if (!STATUS.includes(card.status)) fail(name, `status: one of ${STATUS.join(', ')}`)
  if (card.status === 'deprecated' && !card.replacedBy) fail(name, 'replacedBy: a deprecated block names its replacement')
  if (!Array.isArray(card.cases) || !card.cases.length) fail(name, 'cases: at least one')
  for (const [i, c] of (card.cases ?? []).entries()) {
    if (!str(c.title, 10, 140) || !str(c.why, 10, 300) || !str(c.position, 3, 60) || !MODES.includes(c.mode) || typeof c.props !== 'object') fail(name, `cases[${i}]: title, mode, position, why and props`)
  }
  for (const v of card.variants ?? []) if (!Number.isInteger(v.case) || !card.cases?.[v.case]) fail(name, `variants: «${v.id}» points at no case`)
  if (!str(card.docs, 10, 1200)) fail(name, 'docs: how to install and use, short')
  const { cases, ...rest } = card
  const size = Buffer.byteLength(JSON.stringify(rest))
  if (size > CARD_LIMIT) fail(name, `the card without its cases is ${size} bytes — over ${CARD_LIMIT}: show would cost more`)
}

// ── placement: the two halves of one knowledge agree ────────────────────────────────────────────────────────────────────────
for (const [name, { card }] of cards) {
  for (const host of card.placement?.inside ?? []) {
    const h = cards.get(host)?.card
    if (!h) { fail(name, `placement.inside: «${host}» is not a block of this registry`); continue }
    if ((card.placement.via ?? 'children') === 'children' && !(h.accepts ?? []).some((a) => a === name || a === 'any')) fail(name, `placement.inside names ${host}, but ${host}.accepts does not take it`)
  }
  for (const a of card.accepts ?? []) {
    if (a === 'text' || a === 'any') continue
    const guest = cards.get(a)?.card
    if (!guest) fail(name, `accepts: «${a}» is not a block of this registry`)
    else if (!(guest.placement?.inside ?? []).includes(name)) fail(name, `accepts ${a}, but ${a}.placement.inside does not name ${name}`)
  }
}

// ── generation: registry.json and the showcase module from the cards ───────────────────────────────────────────────────────
function generatedRegistry() {
  const items = registry.items.map((item) => {
    const entry = cards.get(item.name)
    if (!entry) return item
    const { card } = entry
    const meta = Object.fromEntries(Object.entries(card).filter(([k]) => !NOT_META.has(k)))
    const cardFile = { path: entry.rel, type: 'registry:file', target: cardTargetOf(item) }
    const files = [...item.files.filter((f) => f.path !== entry.rel), cardFile]
    const { categories: _c, docs: _d, meta: _m, files: _f, ...keep } = item
    return { ...keep, files, categories: card.categories, docs: card.docs, meta }
  })
  return `${JSON.stringify({ ...registry, items }, null, 2).replace(/\n/g, EOL)}${EOL}`
}

function generatedShowcase() {
  const lines = [
    '// GENERATED by `node scripts/block-cards.mjs --write` from the cards next to the blocks (node step 577-2). Do not edit: --check refuses',
    '// a stale copy. The showcase draws every published block of a section with its card and its cases.',
  ]
  const entries = [...cards.entries()].sort(([a], [b]) => a.localeCompare(b))
  entries.forEach(([, { item, rel, card }], i) => {
    const code = item.files[0].path.replace(/^registry\/src\//, '').replace(/\.tsx?$/, '')
    lines.push(`import { ${card.component} as B${i} } from '@reg/${code}'`)
    lines.push(`import C${i} from '@reg/${rel.replace(/^registry\/src\//, '')}'`)
  })
  lines.push('')
  lines.push('// eslint-disable-next-line @typescript-eslint/no-explicit-any')
  lines.push('export const PUBLISHED_BLOCKS: { name: string; component: any; card: any }[] = [')
  entries.forEach(([name], i) => lines.push(`  { name: '${name}', component: B${i}, card: C${i} },`))
  lines.push(']')
  return `${lines.join('\n')}\n`
}

if (problems.length) {
  console.error(`===BLOCK_CARDS_FAILED=== ${problems.length}`)
  for (const p of problems) console.error(`  ✗ ${p}`)
  process.exit(1)
}

const wantRegistry = generatedRegistry()
const wantShowcase = generatedShowcase()
if (mode === 'write') {
  writeFileSync(REGISTRY, wantRegistry, 'utf8')
  mkdirSync(dirname(SHOWCASE), { recursive: true })
  writeFileSync(SHOWCASE, wantShowcase, 'utf8')
}
const norm = (s) => s.replace(/\r\n/g, '\n')
if (norm(readFileSync(REGISTRY, 'utf8')) !== norm(wantRegistry)) problems.push('registry.json is stale against the cards: run node scripts/block-cards.mjs --write')
if (!existsSync(SHOWCASE) || norm(readFileSync(SHOWCASE, 'utf8')) !== norm(wantShowcase)) problems.push(`${SHOWCASE.slice(ROOT.length + 1)} is stale against the cards: run node scripts/block-cards.mjs --write`)

// ── every case and variant renders on the server ─────────────────────────────────────────────────────────────────────────────
async function renderCases() {
  const esbuild = await import('esbuild')
  const cacheDir = join(ROOT, 'node_modules', '.cache', 'block-cards')
  mkdirSync(cacheDir, { recursive: true })
  const entries = [...cards.values()]
  const entry = [
    "import { createElement as h } from 'react'",
    "import { renderToStaticMarkup } from 'react-dom/server'",
    ...entries.map(({ item, card }, i) => `import { ${card.component} as B${i} } from '${join(ROOT, item.files[0].path).replace(/\\/g, '/')}'`),
    `const BY = { ${entries.map(({ item }, i) => `'${item.name}': B${i}`).join(', ')} }`,
    'const TEXT = { "text-h2": "h2", "text-h3": "h3", "text-h4": "h4", "text-p": "p", "text-small": "small", "text-lead": "p" }',
    'function node(n, key) {',
    '  if (!n || typeof n !== "object") return n',
    '  const { kind, children, text, ...props } = n',
    '  if (TEXT[kind]) return h(TEXT[kind], { key }, text)',
    '  const C = BY[kind]; if (!C) throw new Error(`no block ${kind} for a child`)',
    '  return h(C, { key, ...props }, ...(Array.isArray(children) ? children.map((c, i) => node(c, i)) : children !== undefined ? [children] : []))',
    '}',
    'export function render(name, props) {',
    '  const { children, ...rest } = props',
    '  const kids = Array.isArray(children) ? children.map((c, i) => node(c, i)) : children',
    '  return renderToStaticMarkup(h(BY[name], { ...rest, ...(kids !== undefined ? { children: kids } : {}) }))',
    '}',
  ].join('\n')
  // next/link needs the router of a running Next app; for a render check an anchor with the same href is enough.
  const stub = "import { createElement } from 'react'\nexport default function Link({ href, children, ...p }) { return createElement('a', { href, ...p }, children) }"
  const SRC = join(ROOT, 'registry', 'src')
  const out = join(cacheDir, 'render.mjs')
  await esbuild.build({
    stdin: { contents: entry, resolveDir: ROOT, loader: 'tsx' },
    bundle: true, platform: 'node', format: 'esm', outfile: out, jsx: 'automatic', logLevel: 'silent',
    packages: 'external',
    plugins: [{ name: 'registry-paths', setup(b) {
      // `@/…` inside the registry means the registry's own files (registry/src), not the element's copies of the template.
      b.onResolve({ filter: /^@\// }, async (args) => {
        const r = await b.resolve(`./${args.path.slice(2)}`, { resolveDir: SRC, kind: args.kind })
        return r.errors.length ? { errors: r.errors } : { path: r.path }
      })
      b.onResolve({ filter: /^next\/link$/ }, () => ({ path: 'next-link-stub', namespace: 'stub' }))
      b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: stub, loader: 'jsx', resolveDir: ROOT }))
    } }],
  })
  const { render } = await import(`${pathToFileURL(out).href}?t=${Date.now()}`)
  let rendered = 0
  for (const { item, card } of entries) {
    for (const [i, c] of card.cases.entries()) {
      try { const html = render(item.name, c.props); if (!html) throw new Error('empty'); rendered++ } catch (e) { problems.push(`${item.name}: case ${i} «${c.title}» does not render — ${e.message.split('\n')[0]}`) }
    }
  }
  rmSync(cacheDir, { recursive: true, force: true })
  return rendered
}

const rendered = await renderCases()
if (problems.length) {
  console.error(`===BLOCK_CARDS_FAILED=== ${problems.length}`)
  for (const p of problems) console.error(`  ✗ ${p}`)
  process.exit(1)
}
for (const d of debts) console.log(`  · debt: ${d} — rtl untested (right-to-left languages: ar, he, fa, ur)`)
console.log(`===BLOCK_CARDS_OK=== ${mode === 'write' ? 'written' : 'checked'}: cards ${cards.size}, cases rendered ${rendered}, rtl untested ${debts.length}`)
