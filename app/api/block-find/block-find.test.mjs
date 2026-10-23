// Samples of the door block-find (`npm run test:block-find`): exit code 1 on any miss.
// The catalogue is this element's own (registry-out or registry.json); the journal goes to a temporary data folder.
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { handle } from './block-find.mjs'

const dir = mkdtempSync(join(tmpdir(), 'block-find-'))
process.env.SERVICE_DATA_DIR = dir

let failures = 0
const check = (label, ok, got) => {
  if (!ok) failures++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : `\n     got  ${JSON.stringify(got).slice(0, 400)}`}`)
}

const numbers = await handle({ q: 'three numbers that prove a claim', element: 'reverse' })
check('three numbers → block-metrics first, five at most', numbers.status === 200 && numbers.body.results[0]?.name === 'block-metrics' && numbers.body.results.length <= 5, numbers)
check('the first result names its case, placement and install command', !!numbers.body.results[0]?.case && numbers.body.results[0]?.placement === 'standalone' && numbers.body.results[0]?.install === 'npx shadcn add @fractera/block-metrics', numbers.body.results[0])

const opener = await handle({ q: 'first screen with actions', role: 'opener' })
check('role=opener → only openers', opener.status === 200 && opener.body.results.every((r) => r.role === 'opener' || r.role === 'any'), opener)

const nothing = await handle({ q: 'zzzz qqqq' })
check('a need nobody serves → 200 and no results', nothing.status === 200 && nothing.body.results.length === 0, nothing)

const empty = await handle({ q: '' })
check('no need and no collection → 400', empty.status === 400, empty)

const unknown = await handle({ q: 'cards', collection: 'no-such-project' })
check('unknown collection → 404 with the list of collections', unknown.status === 404 && Array.isArray(unknown.body.collections), unknown)

const lines = existsSync(join(dir, 'find-journal.jsonl')) ? readFileSync(join(dir, 'find-journal.jsonl'), 'utf8').trim().split('\n') : []
check('the journal has one line per answered search (3), «nothing» included', lines.length === 3 && JSON.parse(lines[2]).found.length === 0, lines)

rmSync(dir, { recursive: true, force: true })
if (failures) { console.error(`===TEST_BLOCK_FIND_FAILED=== ${failures}`); process.exit(1) }
console.log('===TEST_BLOCK_FIND_OK===')
