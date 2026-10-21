// @api the shadcn registry of the node blocks for npx shadcn add
import { readFileSync } from "node:fs"
import { itemPath } from "@/lib/blocks-store/registry-store.mjs"
import { json, HEADERS } from "@/lib/blocks-store/http"

// 549-3: прежняя дверь blocks `/r/<имя>.json` и `/r/registry.json` — файл собранного реестра как есть (`shadcn build` → registry-out/);
// чужое имя — 404 `{ error: "not-found" }`. Её зовёт `npx shadcn add @fractera/<имя>` элементов (BLOCKS_REGISTRY_URL).
export const dynamic = "force-dynamic"
type Ctx = { params: Promise<{ file: string }> }

export async function GET(_req: Request, ctx: Ctx) {
  const p = itemPath((await ctx.params).file)
  if (!p) return json(404, { error: "not-found" })
  return new Response(readFileSync(p), { status: 200, headers: HEADERS })
}
