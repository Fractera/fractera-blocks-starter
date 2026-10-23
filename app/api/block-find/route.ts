// @api find catalogue blocks for a need in words five at most
import { NextRequest, NextResponse } from "next/server"
import { needNodeKey, nodeKeyOk, NO_STORE } from "@/lib/node-key"
import { handle } from "./block-find.mjs"

// DOOR block-find — made by `npm run door:add` (node step 548-16). The other elements of the node call it on the machine's loopback
// (http://127.0.0.1:<port>/api/block-find) with the header X-Node-Key; the gate of proxy.ts lets the loopback through, the key decides
// here. The work is `handle()` in ./block-find.mjs — this file only checks the key and turns JSON in and out.
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) return needNodeKey()
  const input = Object.fromEntries(req.nextUrl.searchParams)
  const { status, body } = await handle(input)
  return NextResponse.json(body, { status, headers: NO_STORE })
}
