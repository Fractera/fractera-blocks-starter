// Samples of the door block-requests (`npm run test:block-requests`): exit code 1 on any miss.
// The requests go to a temporary data folder; the catalogue is this element's own (registry.json, taxonomy.json).
import { mkdtempSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { handle } from './block-requests.mjs'

const dir = mkdtempSync(join(tmpdir(), 'block-requests-'))
process.env.SERVICE_DATA_DIR = dir

let failures = 0
const check = (label, ok, got) => {
  if (!ok) failures++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : `\n     got  ${JSON.stringify(got)}`}`)
}

const created = await handle({ action: 'create', need: 'three numbers that prove a claim', from: { element: 'auth', page: '/en' } })
const id = created.body?.request?.id
check('create → 200, stage requested, file written', created.status === 200 && created.body.request.stage === 'requested' && existsSync(join(dir, 'requests', `${id}.json`)), created)

const got = await handle({ action: 'get', id })
check('get → the same need word for word', got.status === 200 && got.body.request.need === 'three numbers that prove a claim', got)

const reuse = await handle({ action: 'stage', id, stage: 'placed', decision: { kind: 'reuse', block: 'block-metrics', reason: 'block-metrics shows exactly three numbers with their labels.' } })
check('placed with reuse of a published block → 200', reuse.status === 200 && reuse.body.request.decision.block === 'block-metrics' && reuse.body.request.history.length === 2, reuse)

const ghost = await handle({ action: 'stage', id, stage: 'placed', decision: { kind: 'reuse', block: 'block-ghost', reason: 'a block that does not exist anywhere.' } })
check('reuse of a block that does not exist → 422', ghost.status === 422 && ghost.body.error === 'invalid_decision', ghost)

const jump = await handle({ action: 'stage', id, stage: 'published', block: 'block-metrics' })
check('placed → published skips described → 409', jump.status === 409, jump)

const cart = await handle({ action: 'create', need: 'shopping cart with line items and a total' })
const section = await handle({ action: 'stage', id: cart.body.request.id, stage: 'placed', decision: { kind: 'new-section', reason: 'No section covers a shop: cart, product card and checkout belong together.', proposal: { id: 'shop', title: { en: 'Shop', ru: 'Магазин' }, purpose: { en: 'Selling goods: product cards, the cart and checkout.', ru: 'Продажа товаров: карточки товара, корзина и оформление заказа.' } } } })
check('new-section proposal → 200', section.status === 200 && section.body.request.decision.proposal.id === 'shop', section)

const taken = await handle({ action: 'stage', id: cart.body.request.id, stage: 'placed', decision: { kind: 'new-section', reason: 'a section that already exists in the dictionary.', proposal: { id: 'hero', title: { en: 'Hero', ru: 'Герой' }, purpose: { en: 'The first screen of a page.', ru: 'Первый экран страницы.' } } } })
check('new-section with an existing id → 422', taken.status === 422, taken)

const empty = await handle({ action: 'create', need: '  ' })
check('create without a need → 400', empty.status === 400, empty)

const list = await handle({ action: 'list' })
check('list → two requests', list.status === 200 && list.body.total === 2, list)

delete process.env.SERVICE_DATA_DIR
const noDir = await handle({ action: 'list' })
check('no SERVICE_DATA_DIR → 500 no_data_dir', noDir.status === 500 && noDir.body.error === 'no_data_dir', noDir)

rmSync(dir, { recursive: true, force: true })
if (failures) { console.error(`===TEST_BLOCK_REQUESTS_FAILED=== ${failures}`); process.exit(1) }
console.log('===TEST_BLOCK_REQUESTS_OK===')
