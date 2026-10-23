// The work of the door GET /api/block-find: find catalogue blocks for a need in words five at most.
// Gets the query string as an object, returns { status, body }: 200 with the result, 400 for input it cannot use, 404 for an unknown
// collection. Pure of the request and the key — route.ts does that.
//
// STAGE 4 OF THE BLOCK LIFECYCLE (node step 577-4; README «Block lifecycle»): `?q=<need>&role=&category=&collection=&element=&limit=`.
// The ranking is `lib/blocks-store/find.mjs` (the same as MCP `search_blocks`). Every call adds one line to the search journal
// `SERVICE_DATA_DIR/find-journal.jsonl` — the query, who asked, what was found or «nothing» (owner 2026-10-23: «Записывать
// (Рекомендую)»): needs that found nothing become requests for new blocks (stage 5 → stage 0). No personal data: a need in words.
import { appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { find } from '../../../lib/blocks-store/find.mjs'

const KEBAB = /^[a-z][a-z0-9-]{1,39}$/
const ROLES = ['opener', 'body', 'closer', 'any']
const bad = (status, error, reason) => ({ status, body: { error, reason } })

function journal(entry) {
  const base = process.env.SERVICE_DATA_DIR
  if (!base) return
  try {
    mkdirSync(base, { recursive: true })
    appendFileSync(join(base, 'find-journal.jsonl'), `${JSON.stringify(entry)}\n`, 'utf8')
  } catch { /* the journal is a measurement, never a reason to refuse a search */ }
}

export async function handle(input) {
  const q = String(input?.q ?? '').trim()
  const { role, category, collection, element } = input ?? {}
  if (q.length > 300) return bad(400, 'bad_request', 'q: the need in words, up to 300 characters')
  if (!q && !collection) return bad(400, 'bad_request', 'q: the need in words (or collection=<project> to list a collection)')
  if (role !== undefined && role !== '' && !ROLES.includes(role)) return bad(400, 'bad_request', `role: one of ${ROLES.join(', ')}`)
  for (const [k, v] of Object.entries({ category, collection, element })) {
    if (v !== undefined && v !== '' && !KEBAB.test(v)) return bad(400, 'bad_request', `${k}: an id in kebab case`)
  }
  const out = find({ q, role: role || undefined, category: category || undefined, collection: collection || undefined, limit: input?.limit })
  if (out.error) return { status: 404, body: out }
  journal({ at: new Date().toISOString(), element: element || null, q, role: role || null, category: category || null, collection: collection || null, found: out.results.map((r) => r.name), total: out.total })
  return { status: 200, body: out }
}
