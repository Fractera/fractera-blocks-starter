// @api create read list and advance block requests through the block lifecycle
import { NextRequest, NextResponse } from "next/server"
import { needNodeKey, nodeKeyOk, NO_STORE } from "@/lib/node-key"
import { handle } from "./block-requests.mjs"

// DOOR block-requests — made by `npm run door:add` (node step 548-16). The other elements of the node call it on the machine's loopback
// (http://127.0.0.1:<port>/api/block-requests) with the header X-Node-Key; the gate of proxy.ts lets the loopback through, the key decides
// here. The work is `handle()` in ./block-requests.mjs — this file only checks the key and turns JSON in and out.
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) return needNodeKey()
  let input: unknown
  try { input = await req.json() } catch {
    return NextResponse.json({ error: "bad_request", reason: "the body must be JSON" }, { status: 400, headers: NO_STORE })
  }
  const { status, body } = await handle(input)
  return NextResponse.json(body, { status, headers: NO_STORE })
}
