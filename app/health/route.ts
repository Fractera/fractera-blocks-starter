// @api health of the blocks element and whether its registry is built
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { registryBuilt, listItems } from "@/lib/blocks-store/registry-store.mjs"
import { json } from "@/lib/blocks-store/http"

// 549-3: дверь прежнего blocks (`/health`), ответ тот же — { ok, service, version, registry, items }.
export const dynamic = "force-dynamic"
const VERSION = (() => { try { return JSON.parse(readFileSync(join(process.env.ELEMENT_DIR || process.cwd(), "package.json"), "utf8")).version as string } catch { return "unknown" } })()

export function GET() {
  const built = registryBuilt()
  return json(200, { ok: true, service: "blocks", version: VERSION, registry: built, items: built ? listItems().length : 0 })
}
