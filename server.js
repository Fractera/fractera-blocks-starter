// ЭЛЕМЕНТ УЗЛА «БЛОКИ» — РЕЕСТР БЛОКОВ СТРАНИЦ ПО МЕТОДОЛОГИИ shadcn (шаг 297, первый AGI ITEM вида user).
//
// Слово владельца 2026-09-25: «самостоятельный AGI ITEM — блоки. У него будет api, или может mcp … Остальные будут
// видеть его как внешний сервер shadcn/ui». Один процесс, один порт, три двери:
//   GET  /health               — жив ли (без ключа: это дверь сторожа);
//   GET  /r/registry.json      — API: реестр в формате shadcn; `npx shadcn add @fractera/<имя>` берёт отсюда;
//   GET  /r/<имя>.json         — API: один блок с кодом и зависимостями;
//   POST /mcp                  — MCP: те же блоки командами для агента (`mcp-tools.js`; каркас — `mcp/serve-mcp.js`).
// A2A и M2M этот прототип НЕ даёт — названо в паспорте, а не скрыто.
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import { mcpHandler } from './mcp/serve-mcp.js'
import { blocksTools } from './mcp-tools.js'
import { registryBuilt, listItems, itemPath } from './registry-store.js'

const ROOT = dirname(fileURLToPath(import.meta.url))
config({ path: join(ROOT, '.env'), quiet: true })

const PORT = Number(process.env.PORT) || 24684
const BIND = process.env.SERVICE_BIND || '127.0.0.1'
const PUBLIC_URL = process.env.SERVICE_PUBLIC_URL || `http://localhost:${PORT}`
const VERSION = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version

const mcp = mcpHandler({ name: 'fractera-blocks', version: VERSION, tools: blocksTools(PUBLIC_URL) })

const json = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' })
  res.end(JSON.stringify(body))
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://x')
  try {
    if (pathname === '/health') {
      return json(res, 200, { ok: true, service: 'blocks', version: VERSION, registry: registryBuilt(), items: registryBuilt() ? listItems().length : 0 })
    }
    if (pathname.startsWith('/r/') && req.method === 'GET') {
      const p = itemPath(pathname.slice(3))
      if (!p) return json(res, 404, { error: 'not-found' })
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' })
      return res.end(readFileSync(p))
    }
    if (pathname === '/mcp') return await mcp(req, res)
    return json(res, 404, { error: 'not-found', doors: ['/health', '/r/registry.json', '/r/<name>.json', '/mcp'] })
  } catch (err) {
    if (!res.headersSent) json(res, 500, { error: err instanceof Error ? err.message : String(err) })
  }
}).listen(PORT, BIND, () => {
  console.log(`fractera-blocks ${VERSION} · http://${BIND}:${PORT} · registry ${registryBuilt() ? 'built' : 'NOT built (npm run build)'}`)
})
