# Fractera Blocks — the shadcn registry of the node blocks

Since **v1.0.0** (node step 549-3) this element is built on the Fractera native element template; its doors did not change.

| Door | What it does |
|---|---|
| `GET /health` | `{ ok, service: "blocks", version, registry, items }` |
| `GET /r/registry.json`, `GET /r/<name>.json` | the registry in the shadcn format — `npx shadcn add @fractera/<name>` (`BLOCKS_REGISTRY_URL`) |
| `GET /r/assets/<path>` | pictures of the blocks (`registry/assets`) |
| `POST /mcp` | MCP: `list_blocks`, `search_blocks`, `get_block`, `install_instructions` |
| `/api/settings/design` | this element's own design (the template door, the node key) |
| `/<lang>`, `/<lang>/guide[/<page>]`, `/showcase/<lang>/<section>` | the catalogue home, the guide, the showcase in the frame of the home |

The blocks live in `registry/src` (the distributed source, never edited for the site) and are built by `shadcn build` into `registry-out/`.
The site reads the registry through the alias `@reg/*` → `.registry-view/`, a copy of `registry/src` with `@/` rewritten to `@reg/`
(`scripts/registry-view.mjs`, first step of `prebuild`): 80 files of the registry have the same paths as files of the template.

---

# fractera-native-item-starter

The reference starter template of a Fractera native element. Native elements are the root elements of a node: they stand on
every node, they come only from the Fractera repository, and they are never sold and never join an outside network. They serve
the person and the other elements of their own node. Custom elements are born from `fractera-custom-item-starter` by the node's
button «Create WEB4 ITEM»; native ones are added from here.

The template is the custom reference template without the network parts: no showcase or Nostr fields in the passport
(`visibility: node`, `messengers: { h2a: true, h2h: false, a2a: false }`), no messenger between people, no work for outside agents
and no order summaries. The home page shows one line, «Reference native template», and the yellow starter sign.

## The contract a replacement must keep

- `OWN-SERVICE-PROPS/` — the passport, the element's main door (`GET /api/own-service-props`); `NODE-CONTRACT.json` — what the node needs to install it.
- The port comes from the `PORT` environment variable.
- `GET /api/health` answers 200 without a session.
- Sign-in only through the node's auth element; stored data only through the node's data element.
- Public pages stay static.

A repository that does not keep this contract is refused; the node does not bend to it.

## Run on its own

```
npm install
npm run build
PORT=24683 node .next/standalone/server.js
```

License: MIT.
