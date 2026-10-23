#!/usr/bin/env node
// PICTURES OF THE BLOCKS — stage 3 of the block lifecycle (node step 577-3; README «Block lifecycle»).
//
//   node scripts/block-shots.mjs --base http://127.0.0.1:<port> [--only <block>]
//
// For every published block: open `/showcase/en/<its first section>` of a running copy of this element, find the drawing of its FIRST
// case (`#<block> [data-block="pubcr"]`) and save exactly that rectangle as `registry/assets/blocks/<block>.png` — served at
// `/r/assets/blocks/<block>.png` from the disk, without a rebuild. A copy of the element must be running: the live one or a preview.
// Chrome without a window through its debugging protocol (Node's own WebSocket); no package is installed for this.
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'

const ROOT = process.cwd()
const args = process.argv.slice(2)
const flag = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined }
const base = (flag('base') ?? '').replace(/\/+$/, '')
const only = flag('only')
if (!/^https?:\/\//.test(base)) { console.error('===SHOTS_FAILED=== --base http://127.0.0.1:<port> of a running copy of this element'); process.exit(1) }

const CHROME = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => p && existsSync(p))
if (!CHROME) { console.error('===SHOTS_FAILED=== Chrome not found: set CHROME_PATH'); process.exit(1) }

const freePort = () => new Promise((res) => { const s = createServer(); s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)) }) })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const registry = JSON.parse(readFileSync(join(ROOT, 'registry.json'), 'utf8'))
const targets = registry.items.filter((i) => i.name.startsWith('block-') && i.meta?.status === 'published' && i.meta?.cases?.length && (!only || i.name === only))
const outDir = join(ROOT, 'registry', 'assets', 'blocks')
mkdirSync(outDir, { recursive: true })

const port = await freePort()
const profile = mkdtempSync(join(tmpdir(), 'block-shots-'))
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore', windowsHide: true })
let page
for (let i = 0; i < 50 && !page; i++) {
  await sleep(200)
  try { page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page') } catch { /* not up yet */ }
}
if (!page) { chrome.kill(); console.error('===SHOTS_FAILED=== Chrome did not open its debugging port'); process.exit(1) }

const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j })
let seq = 0
const waiting = new Map()
const events = []
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && waiting.has(d.id)) { waiting.get(d.id)(d); waiting.delete(d.id) } else if (d.method) events.push(d.method) }
const cdp = (method, params = {}) => new Promise((r) => { const id = ++seq; waiting.set(id, r); ws.send(JSON.stringify({ id, method, params })) })

await cdp('Page.enable')
await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false })
const done = []
const missed = []
for (const item of targets) {
  const section = item.categories?.[0]
  events.length = 0
  await cdp('Page.navigate', { url: `${base}/showcase/en/${section}` })
  for (let i = 0; i < 100 && !events.includes('Page.loadEventFired'); i++) await sleep(100)
  await sleep(600) // the showcase settles: fonts, the one appearance motion of a route card
  const r = await cdp('Runtime.evaluate', { returnByValue: true, expression: `(() => { const el = document.querySelector('#${item.name} [data-block="pubcr"]'); if (!el) return null; el.scrollIntoView({ block: 'start' }); const b = el.getBoundingClientRect(); return { x: b.left + window.scrollX, y: b.top + window.scrollY, width: b.width, height: b.height } })()` })
  const box = r.result?.result?.value
  if (!box || !box.width || !box.height) { missed.push(`${item.name} (no #${item.name} on /showcase/en/${section})`); continue }
  const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...box, scale: 1 } })
  writeFileSync(join(outDir, `${item.name}.png`), Buffer.from(shot.result.data, 'base64'))
  done.push(`${item.name} ${Math.round(box.width)}×${Math.round(box.height)}`)
}
ws.close()
chrome.kill()
await sleep(300)
try { rmSync(profile, { recursive: true, force: true }) } catch { /* Chrome may still hold a file for a moment */ }
for (const d of done) console.log(`  ✓ ${d}`)
for (const m of missed) console.log(`  ✗ ${m}`)
console.log(`${missed.length ? '===SHOTS_PARTIAL===' : '===SHOTS_OK==='} pictures ${done.length} of ${targets.length} → registry/assets/blocks/`)
process.exit(missed.length ? 1 : 0)
