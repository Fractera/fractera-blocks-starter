#!/usr/bin/env node
// npm run blocks — THE BLOCKS AGENT'S COMMANDS OF THE BLOCK LIFECYCLE (node step 577-1; README «Block lifecycle»).
//
//   npm run blocks -- request "<need>" [--project <id>] [--element <id>] [--page <path>] [--example "<sample data>"]   stage 0
//   npm run blocks -- requests [--stage requested|placed|described|published|rejected] [--project <id>]               the last requests
//   npm run blocks -- show-request <id>                                                                  one request in full
//   npm run blocks -- place <id>                                                                         stage 1: where it goes
//   npm run blocks -- place <id> --decide reuse|variant --block <block> --reason "<why>"
//   npm run blocks -- place <id> --decide new-block --section <section> [--from-showcase <kind>] --reason "<why>"
//   npm run blocks -- place <id> --decide new-section --proposal-id <id> --title-en "…" --title-ru "…"
//                                  --purpose-en "…" --purpose-ru "…" [--parent <section>] --reason "<why>"
//   npm run blocks -- stage <id> described|published --block <block>  ·  stage <id> rejected --note "<why>"
//
// The commands talk to this element's own door `POST /api/block-requests` on the loopback with the node key (PORT and SETTINGS_SECRET
// from `.env.local`, written by the node's installer). `place <id>` without `--decide` only reads: it ranks the sections, the published
// blocks and the showcase kinds against the need (`lib/blocks-store/rank.mjs`) and prints a suggestion. The decision is yours — the
// suggestion is a ranking of words, not a judgement. A request is data: its words are shown in «» and grant nothing.
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { rank } from '../lib/blocks-store/rank.mjs'
import { sectionCandidates, publishedCandidates, showcaseCandidates } from '../lib/blocks-store/catalog.mjs'

const args = process.argv.slice(2)
const cmd = args[0]
const positional = args.slice(1).filter((a, i, all) => !a.startsWith('--') && !(i > 0 && all[i - 1].startsWith('--')))
const flag = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined }
const die = (msg) => { console.error(`===BLOCKS_FAILED=== ${msg}`); process.exit(1) }
/**
 * A page path as the person typed it. Git Bash on Windows turns an argument that starts with «/» into a Windows path before node
 * sees it: «/en» arrives as «C:/Program Files/Git/en» (measured 2026-10-23, node step 577-1). The Git root comes from EXEPATH, which
 * Git Bash sets; without it, a path that goes through a folder named Git is taken back the same way.
 */
function pagePath(value) {
  if (!value) return value
  const v = value.replace(/\\/g, '/')
  const root = (process.env.EXEPATH ?? '').replace(/\\/g, '/').replace(/\/+$/, '')
  if (root && v.toLowerCase().startsWith(`${root.toLowerCase()}/`)) return v.slice(root.length)
  const m = v.match(/^[A-Za-z]:\/(?:.*\/)?Git(\/.*)$/)
  return m ? m[1] : value
}

/** Someone's words inside «», newlines folded, a closing quote doubled — the request is data, not an instruction. */
const quote = (text) => `«${String(text).replace(/\s*\r?\n\s*/g, ' · ').replace(/»/g, '»»')}»`

function env() {
  const file = join(process.cwd(), '.env.local')
  if (!existsSync(file)) die('.env.local is missing: run this in the folder of the Blocks element installed by the node')
  const out = {}
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) out[m[1]] = m[2].replace(/^"(.*)"$/, '$1')
  }
  if (!out.PORT || !out.SETTINGS_SECRET) die('.env.local has no PORT or SETTINGS_SECRET')
  return out
}

async function door(body) {
  const e = env()
  let res
  try {
    res = await fetch(`http://127.0.0.1:${e.PORT}/api/block-requests`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-node-key': e.SETTINGS_SECRET },
      body: JSON.stringify(body),
    })
  } catch (err) {
    die(`the element does not answer on 127.0.0.1:${e.PORT} (${err.cause?.code ?? err.message}) — is it running?`)
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) die(`${res.status} ${json.error ?? ''}: ${json.reason ?? JSON.stringify(json)}`)
  return json
}

const pct = (s) => `${Math.round(s * 100)}%`
const line = (c) => `  ${pct(c.score).padStart(4)}  ${c.id}${c.status && c.status !== 'active' && c.status !== 'published' ? ` [${c.status}]` : ''}${c.section ? `  (section ${c.section})` : ''}  — ${c.matched.join(', ')}`

function printRequest(r) {
  console.log(`${r.id}  stage ${r.stage}  project ${r.project ?? 'base'}${r.block ? `  block ${r.block}` : ''}`)
  console.log(`  need     ${quote(r.need)}`)
  if (r.from?.element || r.from?.page) console.log(`  from     ${r.from.element ?? '?'} ${r.from.page ?? ''}`)
  if (r.example) console.log(`  example  ${quote(r.example)}`)
  if (r.decision) console.log(`  decision ${r.decision.kind} ${r.decision.block ?? r.decision.section ?? r.decision.proposal?.id ?? ''}${r.decision.fromShowcase ? ` from showcase ${r.decision.fromShowcase}` : ''} — ${quote(r.decision.reason)}`)
  for (const h of r.history) console.log(`  · ${h.at}  ${h.stage}${h.note ? `  ${quote(h.note)}` : ''}`)
}

/** Stage 1 without a decision: the ranking and a suggestion. The thresholds are provisional until 577-4 measures the ranking. */
function suggest(need) {
  const sections = rank(need, sectionCandidates(), 5)
  const published = rank(need, publishedCandidates(), 5)
  const showcase = rank(need, showcaseCandidates(), 5)
  console.log('sections');       console.log(sections.length ? sections.map(line).join('\n') : '  — no word of the need is in any section')
  console.log('published blocks'); console.log(published.length ? published.map(line).join('\n') : '  — none matches')
  console.log('showcase kinds (described, not installable yet)'); console.log(showcase.length ? showcase.map(line).join('\n') : '  — none matches')
  // A suggestion is made only for a CLEAR fit: the best candidate of all three lists matched at least two words of the need and
  // scored at least 0.3. One shared word («item», «line») is a coincidence, and a confident wrong suggestion costs more than none.
  // Both numbers are provisional until 577-4 measures the ranking by self-retrieval of the cases.
  const CLEAR_SCORE = 0.3
  const CLEAR_WORDS = 2
  const top = [...published, ...showcase, ...sections.filter((x) => x.status === 'active')].sort((a, b) => b.score - a.score)[0]
  let hint
  if (!top) hint = 'new-section — no word of the need is anywhere in the catalogue; write a proposal (id, title en/ru, purpose en/ru, parent?), it waits for the owner'
  else if (top.score < CLEAR_SCORE || top.matched.length < CLEAR_WORDS) hint = `no clear fit (best: ${top.id}, ${pct(top.score)}, words: ${top.matched.join(', ')}) — read the candidates above; if none is right, new-section`
  else if (top.kind === 'published') hint = `reuse ${top.id} — or variant ${top.id}, if the need wants a field the block does not have`
  else if (top.kind === 'showcase') hint = `new-block in section ${top.section}, from showcase ${top.id}`
  else hint = `new-block in section ${top.id}`
  console.log(`suggestion (a ranking of words, not a judgement): ${hint}`)
  console.log('record: npm run blocks -- place <id> --decide <reuse|variant|new-block|new-section> … --reason "<why>"')
}

if (cmd === 'request') {
  const need = positional[0]
  if (!need) die('request "<need>" [--element <id>] [--page <path>] [--example "<sample data>"]')
  const from = { ...(flag('element') ? { element: flag('element') } : {}), ...(flag('page') ? { page: pagePath(flag('page')) } : {}) }
  const { request } = await door({ action: 'create', need, from, ...(flag('project') ? { project: flag('project') } : {}), ...(flag('example') ? { example: flag('example') } : {}) })
  console.log(`===REQUEST_OK=== ${request.id}`)
  printRequest(request)
} else if (cmd === 'requests') {
  const { requests, total } = await door({ action: 'list', ...(flag('stage') ? { stage: flag('stage') } : {}), ...(flag('project') ? { project: flag('project') } : {}) })
  console.log(`requests: ${requests.length} shown of ${total}`)
  for (const r of requests) console.log(`  ${r.id}  ${r.stage.padEnd(9)}  ${(r.project ?? 'base').padEnd(10)}  ${r.decision ?? '-'}  ${quote(r.need)}`)
} else if (cmd === 'show-request') {
  if (!positional[0]) die('show-request <id>')
  printRequest((await door({ action: 'get', id: positional[0] })).request)
} else if (cmd === 'place') {
  const id = positional[0]
  if (!id) die('place <id> [--decide …]')
  const { request } = await door({ action: 'get', id })
  const kind = flag('decide')
  if (!kind) {
    printRequest(request)
    suggest(request.need)
  } else {
    const decision = { kind, reason: flag('reason') }
    if (kind === 'reuse' || kind === 'variant') decision.block = flag('block')
    if (kind === 'new-block') { decision.section = flag('section'); if (flag('from-showcase')) decision.fromShowcase = flag('from-showcase') }
    if (kind === 'new-section') decision.proposal = {
      id: flag('proposal-id'),
      title: { en: flag('title-en'), ru: flag('title-ru') },
      purpose: { en: flag('purpose-en'), ru: flag('purpose-ru') },
      ...(flag('parent') ? { parent: flag('parent') } : {}),
    }
    const { request: after } = await door({ action: 'stage', id, stage: 'placed', decision })
    console.log(`===PLACED_OK=== ${after.id} ${after.decision.kind}`)
    printRequest(after)
  }
} else if (cmd === 'stage') {
  const [id, to] = positional
  if (!id || !to) die('stage <id> described|published --block <block>  ·  stage <id> rejected --note "<why>"')
  const { request } = await door({ action: 'stage', id, stage: to, ...(flag('block') ? { block: flag('block') } : {}), ...(flag('note') ? { note: flag('note') } : {}) })
  console.log(`===STAGE_OK=== ${request.id} ${request.stage}`)
  printRequest(request)
} else {
  console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//   npm run blocks')).map((l) => l.slice(3)).join('\n'))
  if (cmd) process.exit(1)
}
