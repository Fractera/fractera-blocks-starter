// THE BLOCK CATALOGUE AS CANDIDATES (node step 577-1). What a need can be matched against, read from the element's own files:
//   sections   — `registry/src/sections/taxonomy.json` → `types` (id, title, purpose, variants, status, parent);
//   published  — `registry.json` → items `block-*`: the blocks an element can install (`npx shadcn add @fractera/<name>`);
//   showcase   — `taxonomy.json` → `kinds` that have no published block: described in `SECTIONS.json`, not installable yet.
// The root is ELEMENT_DIR (the installer gives an absolute path; a standalone server changes its folder) or the current folder
// (a script run in the element folder). Only reading; the writers of these files are people and the Blocks agent.
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

export const ROOT = process.env.ELEMENT_DIR || process.cwd()
const TAXONOMY = join(ROOT, 'registry', 'src', 'sections', 'taxonomy.json')
const SECTIONS = join(ROOT, 'registry', 'src', 'sections', 'SECTIONS.json')
const REGISTRY = join(ROOT, 'registry.json')

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))
/** heroCentered → block-hero-centered: the name a showcase kind would have as a published block. */
export const blockNameOf = (kind) => `block-${kind.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`
/** heroCentered → «hero centered»: words of a kind name for matching. */
const kindWords = (kind) => kind.replace(/([A-Z])/g, ' $1').toLowerCase()
/** The first paragraph of a showcase description without its «**Type:** …» line and markdown marks. */
const firstParagraph = (text) => String(text ?? '')
  .replace(/\*\*Type:\*\*[^\n]*\n?/g, '')
  .replace(/[#*`>|_]/g, ' ')
  .split(/\n\s*\n/).map((p) => p.trim()).find(Boolean)?.slice(0, 600) ?? ''

export function readTaxonomy() {
  if (!existsSync(TAXONOMY)) throw new Error(`no taxonomy: ${TAXONOMY}`)
  const t = readJson(TAXONOMY)
  return { types: t.types ?? [], kinds: t.kinds ?? {} }
}

export function readRegistryItems() {
  if (!existsSync(REGISTRY)) throw new Error(`no registry: ${REGISTRY}`)
  return readJson(REGISTRY).items ?? []
}

export function sectionCandidates() {
  return readTaxonomy().types.map((t) => ({
    id: t.id,
    kind: 'section',
    status: t.status ?? 'active',
    parent: t.parent ?? null,
    title: t.title?.en ?? t.id,
    fields: [
      { text: `${t.id.replace(/-/g, ' ')} ${t.title?.en ?? ''}`, weight: 1 },
      { text: t.purpose?.en ?? '', weight: 0.8 },
      { text: t.variants?.en ?? '', weight: 0.6 },
    ],
  }))
}

/** block-hero-centered → heroCentered: the showcase kind a published block came from, if any. */
export const kindNameOf = (block) => block.replace(/^block-/, '').replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())

export function publishedCandidates() {
  // A published block that came from a showcase kind keeps that kind's description: the rules of place and count are written there.
  const described = existsSync(SECTIONS) ? (readJson(SECTIONS).kinds ?? {}) : {}
  return readRegistryItems().filter((i) => i.name.startsWith('block-')).map((i) => {
    const meta = i.meta ?? {}
    const cases = Array.isArray(meta.cases) ? meta.cases.map((c) => c.title ?? '').join('. ') : ''
    return {
      id: i.name,
      kind: 'published',
      title: i.title ?? i.name,
      status: meta.status ?? 'published',
      categories: i.categories ?? [],
      fields: [
        { text: `${i.name.replace(/^block-/, '').replace(/-/g, ' ')} ${i.title ?? ''}`, weight: 1 },
        { text: cases, weight: 1 },
        { text: meta.use ?? '', weight: 1 },
        { text: i.description ?? '', weight: 0.8 },
        { text: firstParagraph(described[kindNameOf(i.name)]?.description), weight: 0.6 },
      ],
    }
  })
}

export function showcaseCandidates() {
  const { types, kinds } = readTaxonomy()
  const published = new Set(readRegistryItems().map((i) => i.name))
  const described = existsSync(SECTIONS) ? (readJson(SECTIONS).kinds ?? {}) : {}
  const typeTitle = Object.fromEntries(types.map((t) => [t.id, t.title?.en ?? t.id]))
  return Object.entries(kinds)
    .filter(([kind]) => !published.has(blockNameOf(kind)))
    .map(([kind, k]) => ({
      id: kind,
      kind: 'showcase',
      title: kindWords(kind),
      section: k.type ?? null,
      fields: [
        { text: kindWords(kind), weight: 1 },
        { text: firstParagraph(described[kind]?.description), weight: 0.6 },
        { text: typeTitle[k.type] ?? '', weight: 0.4 },
      ],
    }))
}
