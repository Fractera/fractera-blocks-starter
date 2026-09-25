// MCP ЛЮБОГО МИКРОСЕРВИСА FRACTERA — ОДИН МОДУЛЬ, НИЧЕГО НЕ ЗНАЮЩИЙ О ПРЕДМЕТЕ СЛУЖБЫ (шаг 297).
//
// Слово владельца 2026-09-25: «Микросервис анатомически имеет свой собственный: Api, mcp, a2a, M2M протоколы … надо
// делать правильный прототип настоящего переиспользуемого blocks fractera mcp, чтобы любой сервис мог это
// использовать». Отсюда форма: служба отдаёт СВОИ команды (`tools`) — этот модуль превращает их в MCP-сервер на её же
// порту, по адресу `/mcp`. Другая служба копирует папку `mcp/` целиком и пишет только свой файл команд.
//
// Транспорт — Streamable HTTP официальной библиотеки (@modelcontextprotocol/sdk 1.29), режим БЕЗ СЕССИЙ: на каждый
// запрос свой сервер и свой транспорт. Состояния нет — службу можно перезапускать и держать сколько угодно копий.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'

/**
 * @param {{ name: string, version: string, tools: Array<{ name: string, title: string, description: string,
 *   inputSchema?: object, run: (args: any) => Promise<any> | any }> }} service
 * @returns {(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => Promise<void>}
 */
export function mcpHandler(service) {
  function build() {
    const server = new McpServer({ name: service.name, version: service.version })
    for (const t of service.tools) {
      server.registerTool(t.name, { title: t.title, description: t.description, inputSchema: t.inputSchema }, async (args) => {
        try {
          const out = await t.run(args ?? {})
          return { content: [{ type: 'text', text: typeof out === 'string' ? out : JSON.stringify(out, null, 2) }] }
        } catch (err) {
          return { isError: true, content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }] }
        }
      })
    }
    return server
  }

  return async (req, res) => {
    let body
    if (req.method === 'POST') {
      const chunks = []
      for await (const c of req) chunks.push(c)
      try { body = JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null') } catch {
        res.writeHead(400, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null }))
        return
      }
    }
    const server = build()
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
    res.on('close', () => { transport.close(); server.close() })
    await server.connect(transport)
    await transport.handleRequest(req, res, body)
  }
}
