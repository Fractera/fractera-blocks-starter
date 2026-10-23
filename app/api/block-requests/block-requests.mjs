// The work of the door POST /api/block-requests: create read list and advance block requests through the block lifecycle.
// Gets the JSON body, returns { status, body }: 200 with the result, 400/404/409/422 with { error, reason }, 500 when the element has
// no data folder. Pure: no request, no key — route.ts does that.
//
// THE BLOCK REQUEST (node step 577-1, stages 0 and 1 of the block lifecycle — README «Block lifecycle»). A request is DATA, not an
// instruction: the need is kept word for word and grants no right to anyone who reads it. It lives outside git, in the element's data
// folder: `SERVICE_DATA_DIR/requests/<id>.json` — the working process writes data, the building process writes code (node law 465-4).
//
// Actions (field `action`):
//   create { need, from?: { element?, page? }, example? }            → the new request, stage `requested`
//   get    { id }                                                     → the request
//   list   { stage? }                                                 → the last 50, short
//   stage  { id, stage, decision?, block?, note? }                    → the request after the move; history keeps every move
// Stages: requested → placed → described → published; any of them → rejected. `placed` again changes the decision.
// The decision of stage 1 (`placed`) is one of four, checked against the catalogue:
//   reuse <block> · variant <block> — a published block `block-*`;
//   new-block <section> [fromShowcase <kind>] — an active section; a showcase kind without a published block;
//   new-section { id, title {en,ru}, purpose {en,ru}, parent? } — becomes a section only by the owner's word (status `proposed`).
import { mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'
import { readTaxonomy, readRegistryItems, blockNameOf } from '../../../lib/blocks-store/catalog.mjs'

const ID = /^req-\d{8}-[a-z0-9]{6}$/
const KEBAB = /^[a-z][a-z0-9-]{1,39}$/
const STAGES = ['requested', 'placed', 'described', 'published', 'rejected']
const NEXT = { requested: ['placed', 'rejected'], placed: ['placed', 'described', 'rejected'], described: ['published', 'rejected'], published: [], rejected: [] }
const DECISIONS = ['reuse', 'variant', 'new-block', 'new-section']

const bad = (status, error, reason) => ({ status, body: { error, reason } })
const str = (v, min, max) => typeof v === 'string' && v.trim().length >= min && v.trim().length <= max

function folder() {
  const base = process.env.SERVICE_DATA_DIR
  if (!base) return null
  const dir = join(base, 'requests')
  mkdirSync(dir, { recursive: true })
  return dir
}

function save(dir, request) {
  const file = join(dir, `${request.id}.json`)
  const tmp = `${file}.tmp`
  writeFileSync(tmp, `${JSON.stringify(request, null, 2)}\n`, 'utf8')
  renameSync(tmp, file)
}

function load(dir, id) {
  const file = join(dir, `${id}.json`)
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null
}

function newId() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `req-${d}-${randomBytes(4).toString('hex').slice(0, 6)}`
}

/** The reason a decision cannot stand, or null. Checked against the element's own catalogue files. */
function decisionProblem(decision) {
  if (!decision || typeof decision !== 'object') return 'decision is required for the stage placed'
  if (!DECISIONS.includes(decision.kind)) return `decision.kind must be one of ${DECISIONS.join(', ')}`
  if (!str(decision.reason, 10, 600)) return 'decision.reason: one to three sentences (10–600 characters) — why this and not the others'
  const published = new Set(readRegistryItems().filter((i) => i.name.startsWith('block-')).map((i) => i.name))
  const { types, kinds } = readTaxonomy()
  const sections = new Map(types.map((t) => [t.id, t]))
  if (decision.kind === 'reuse' || decision.kind === 'variant') {
    if (!published.has(decision.block)) return `decision.block «${decision.block}» is not a published block of this registry`
    return null
  }
  if (decision.kind === 'new-block') {
    const s = sections.get(decision.section)
    if (!s) return `decision.section «${decision.section}» is not a section of taxonomy.json`
    if ((s.status ?? 'active') !== 'active') return `section «${decision.section}» is ${s.status}: a block goes only into an active section`
    if (decision.fromShowcase !== undefined) {
      if (!kinds[decision.fromShowcase]) return `decision.fromShowcase «${decision.fromShowcase}» is not a showcase kind`
      if (published.has(blockNameOf(decision.fromShowcase))) return `showcase kind «${decision.fromShowcase}» is already published as ${blockNameOf(decision.fromShowcase)}: reuse it`
    }
    return null
  }
  const p = decision.proposal
  if (!p || !KEBAB.test(p.id ?? '')) return 'decision.proposal.id: a new section id in kebab case'
  if (sections.has(p.id)) return `section «${p.id}» already exists: decide new-block in it`
  if (!str(p.title?.en, 2, 60) || !str(p.title?.ru, 2, 60)) return 'decision.proposal.title: { en, ru }'
  if (!str(p.purpose?.en, 10, 300) || !str(p.purpose?.ru, 10, 300)) return 'decision.proposal.purpose: { en, ru }, one sentence each'
  if (p.parent !== undefined && !sections.has(p.parent)) return `decision.proposal.parent «${p.parent}» is not a section`
  return null
}

export async function handle(input) {
  const dir = folder()
  if (!dir) return bad(500, 'no_data_dir', 'SERVICE_DATA_DIR is not set: the element was not installed by the node')
  const action = input?.action

  if (action === 'create') {
    if (!str(input.need, 3, 2000)) return bad(400, 'bad_request', 'need: the need in words, 3–2000 characters')
    const from = input.from ?? {}
    if (from.element !== undefined && !KEBAB.test(from.element)) return bad(400, 'bad_request', 'from.element: an element id')
    if (from.page !== undefined && !str(from.page, 1, 300)) return bad(400, 'bad_request', 'from.page: a page path, up to 300 characters')
    if (input.example !== undefined && !str(input.example, 1, 4000)) return bad(400, 'bad_request', 'example: sample data as text, up to 4000 characters')
    const at = new Date().toISOString()
    const request = {
      id: newId(),
      need: input.need.trim(),
      from: { ...(from.element ? { element: from.element } : {}), ...(from.page ? { page: from.page } : {}) },
      ...(input.example ? { example: input.example } : {}),
      createdAt: at,
      stage: 'requested',
      decision: null,
      block: null,
      history: [{ stage: 'requested', at, note: 'created' }],
    }
    save(dir, request)
    return { status: 200, body: { request } }
  }

  if (action === 'get') {
    if (!ID.test(input.id ?? '')) return bad(400, 'bad_request', 'id: req-YYYYMMDD-xxxxxx')
    const request = load(dir, input.id)
    return request ? { status: 200, body: { request } } : bad(404, 'not_found', `no request ${input.id}`)
  }

  if (action === 'list') {
    if (input.stage !== undefined && !STAGES.includes(input.stage)) return bad(400, 'bad_request', `stage: one of ${STAGES.join(', ')}`)
    const all = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
    const requests = all
      .filter((r) => !input.stage || r.stage === input.stage)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 50)
      .map((r) => ({ id: r.id, stage: r.stage, createdAt: r.createdAt, need: r.need.slice(0, 160), from: r.from, decision: r.decision?.kind ?? null, block: r.block }))
    return { status: 200, body: { requests, total: all.length } }
  }

  if (action === 'stage') {
    if (!ID.test(input.id ?? '')) return bad(400, 'bad_request', 'id: req-YYYYMMDD-xxxxxx')
    const request = load(dir, input.id)
    if (!request) return bad(404, 'not_found', `no request ${input.id}`)
    const to = input.stage
    if (!STAGES.includes(to)) return bad(400, 'bad_request', `stage: one of ${STAGES.join(', ')}`)
    if (!NEXT[request.stage].includes(to)) return bad(409, 'bad_transition', `${request.stage} → ${to} is not a move of the lifecycle`)
    if (to === 'placed') {
      const problem = decisionProblem(input.decision)
      if (problem) return bad(422, 'invalid_decision', problem)
      request.decision = input.decision
    }
    if (to === 'described' || to === 'published') {
      if (!/^block-[a-z0-9-]{2,60}$/.test(input.block ?? '')) return bad(400, 'bad_request', 'block: the name of the block this request became')
      if (to === 'published' && !readRegistryItems().some((i) => i.name === input.block)) return bad(422, 'invalid_block', `${input.block} is not in registry.json: publish it first`)
      request.block = input.block
    }
    if (to === 'rejected' && !str(input.note, 3, 600)) return bad(400, 'bad_request', 'note: why the request is rejected')
    request.stage = to
    request.history.push({ stage: to, at: new Date().toISOString(), note: input.note ?? (input.decision?.reason ?? '') })
    save(dir, request)
    return { status: 200, body: { request } }
  }

  return bad(400, 'bad_request', 'action: create · get · list · stage')
}
