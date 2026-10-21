// 549-3: ответы дверей blocks — те же заголовки, что у прежнего node:http-сервера (server.js v0.5.24: `json()` — тип и ACAO *).
export const HEADERS = { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" }
export const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: HEADERS })
