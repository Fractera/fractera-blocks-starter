// FIND A BLOCK FOR A NEED — stage 4 of the block lifecycle (node step 577-4; README «Block lifecycle»). One function for the door
// `GET /api/block-find`, the MCP tool `search_blocks` and, through the door, `npm run blocks -- find` of every element.
//
// 🔒 FIVE AT MOST, whatever the size of the catalogue (law of node step 548-14: the cost of an agent must not grow with the node).
// Searches the SERVED index (`registry-out`): what an element can install now. A deprecated block is never offered.
// With a collection (owner 2026-10-23 «Включить в 577»): the blocks of the project's collection come first, then the rest.
import { words, score } from './rank.mjs'
import { publishedCandidates, readBuiltItems, readCollections } from './catalog.mjs'

const LIMIT = 5

/** The case of a card whose situation is closest to the need — what the agent reads first. */
function bestCase(cases, needWords) {
  let best = null
  for (const c of cases ?? []) {
    const s = score(needWords, [{ text: c.title, weight: 1 }, { text: c.why, weight: 0.6 }]).score
    if (!best || s > best.s) best = { s, title: c.title }
  }
  return best?.title ?? null
}

/** What a placement says in the owner's words: standalone · standalone and inside X · only inside X. */
export function placementText(p) {
  const list = (p?.inside ?? []).join(', ')
  if (p?.page && !list) return 'standalone'
  if (p?.page) return `standalone and inside ${list}`
  return `only inside ${list}`
}

/**
 * find({ q, role?, category?, collection?, limit? }) → { results, total, collection }
 * results: [{ name, title, score, matched, conflicts, case, role, placement, repeat, slots, version, install, inCollection }]
 */
export function find({ q = '', role, category, collection, limit = LIMIT } = {}) {
  const items = readBuiltItems()
  const byName = new Map(items.map((i) => [i.name, i]))
  let members = null
  if (collection) {
    const c = readCollections().find((x) => x.id === collection)
    if (!c) return { error: 'unknown_collection', reason: `no collection «${collection}» in registry/src/collections`, collections: readCollections().map((x) => x.id) }
    members = new Set(c.blocks ?? [])
  }
  const needWords = words(q)
  // A search answers with five at most; listing a collection (no need, a project) answers with the collection itself — its size is
  // the project's, not the catalogue's, so the cost still does not grow with the catalogue.
  const n = !needWords.size && members ? Math.min(members.size, 50) : Math.min(Math.max(1, Number(limit) || LIMIT), LIMIT)
  const scored = publishedCandidates(items)
    .filter((c) => c.status !== 'deprecated')
    .filter((c) => !role || byName.get(c.id)?.meta?.role === role || byName.get(c.id)?.meta?.role === 'any')
    .filter((c) => !category || (c.categories ?? []).includes(category))
    .map((c) => ({ c, ...(needWords.size ? score(needWords, c.fields) : { score: 0, matched: [], conflicts: [] }) }))
    // An empty need lists a collection; a need with words keeps only candidates that matched at least one of them.
    .filter((x) => (needWords.size ? x.score > 0 : !!members))
    .sort((a, b) => {
      const ma = members?.has(a.c.id) ? 1 : 0
      const mb = members?.has(b.c.id) ? 1 : 0
      return mb - ma || b.score - a.score || a.c.id.localeCompare(b.c.id)
    })
  const results = scored.slice(0, n).map(({ c, score: s, matched, conflicts }) => {
    const meta = byName.get(c.id)?.meta ?? {}
    return {
      name: c.id,
      title: c.title,
      score: s,
      matched,
      conflicts,
      case: bestCase(meta.cases, needWords),
      role: meta.role ?? null,
      placement: placementText(meta.placement),
      repeat: meta.repeat ?? null,
      slots: meta.slots ?? {},
      version: meta.version ?? null,
      install: `npx shadcn add @fractera/${c.id}`,
      inCollection: members ? members.has(c.id) : undefined,
    }
  })
  return { results, total: scored.length, collection: collection ?? null }
}
