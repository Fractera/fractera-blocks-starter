# Fractera Blocks — the registry of page blocks

The first AGI ITEM of kind **user** (step 297, 2026-09-25). It stands in the node next to root, auth and data, in
`AGI-ITEMS/user/blocks`, and is the **reference** for how a microservice of the node is built.

> Owner, 2026-09-25: «самостоятельный AGI ITEM — блоки. У него будет api, или может mcp … Остальные будут видеть его как
> внешний сервер shadcn/ui». «Микросервис анатомически имеет свой собственный: Api, mcp, a2a, M2M протоколы и мы обязаны
> предоставить или один или все.»

## What it gives

Every page block as **source code** with its dependencies. A project takes only the blocks it needs, owns the copy,
and keeps working if this registry disappears.

| Protocol | Provided | Door |
|---|---|---|
| API | yes | `GET /r/registry.json`, `GET /r/<name>.json` — the shadcn registry format |
| MCP | yes | `POST /mcp` — Streamable HTTP, stateless; tools below |
| A2A | **no** | not built in the prototype |
| M2M | **no** | not built in the prototype |

`GET /health` — liveness, no key: `{ ok, version, registry, items }`.

**The public home page** — `/en`, `/ru` (Next 16 in the same process): indexable, breadcrumbs and FAQ by the project
settings, `/<lang>/index.md` for agents, `robots.txt`, `sitemap.xml`. Details — `presentation/app/[lang]/README.md`.

## The anatomy of a microservice (what every AGI ITEM carries)

| Part | Here |
|---|---|
| its own repository | `Fractera/fractera-blocks-starter` |
| passport — what the node reads | `OWN-SERVICE-PROPS.json` (port wish, env file, health, runtime, **protocols**, doors) |
| questions to the installer | `.env.example` — `# kind: derived \| secret \| foreign` above each variable |
| its protocols, each on its own address | API `/r/*`, MCP `/mcp` |
| its own MCP | the folder `mcp/` — **a copy lives inside every AGI ITEM**; it knows nothing about blocks. The service writes only its own tool file (`mcp-tools.js` here) |
| **the project design — inherited, never its own** | door `GET|PATCH /api/settings/design` + `DESIGN-CONFIG/` (passport `settings.owns`); the node installer seeds it from the site at birth, the core sends every later change |
| its page in the core menu | `/architect/blocks` (globe, under «Data») |
| its agent (three parts) | to be installed with the core's ready-made kit `_agent-kit` — **not done yet** |

## MCP tools

| Tool | Input | Gives |
|---|---|---|
| `list_blocks` | — | name, title, description, type, dependencies of every block |
| `search_blocks` | `query` | blocks whose name/title/description contains it |
| `get_block` | `name` | the block in full: files with source, npm and registry dependencies |
| `install_instructions` | `name` | the `components.json` entry and the `npx shadcn add @fractera/<name>` command |

Connect an agent: `claude mcp add --transport http fractera-blocks <public address>/mcp`.

## Install a block into a project (the shadcn way)

`components.json`:

```json
{ "registries": { "@fractera": "<public address>/r/{name}.json" } }
```

then `npx shadcn@latest add @fractera/dialog-sample` — it brings `@fractera/app-dialog` and shadcn's `dialog` with it.
Update: `npx shadcn@latest add @fractera/<name> --diff` shows what changed, `--overwrite` takes it.

## How to add a block

1. Put its files under `registry/src/` **at the path they will have in the consumer** (`components/blocks/<name>.tsx`,
   `lib/blocks/…`); imports use the consumer's aliases (`@/components/...`). The element's own site resolves the same
   files through the tsconfig fallback — one copy serves the site and the registry.
2. Add an item to `registry.json`: `name`, `type`, `title`, `description`, `registryDependencies` (shadcn names or
   `@fractera/<name>`), `files` with `target` — where the file lands in the consumer.
3. `npm run build` → `public/r/<name>.json`. The API and the MCP read the same files.

## Pages — a data folder each, one template for all (step 298)

A page of this site is a folder in `presentation/content/<collection>/<slug>/` (`meta.json` + `<lang>.json` with the
title, the lead and catalogue blocks). One route serves every page and every collection index:
`presentation/app/[lang]/[collection]/[[...slug]]/page.tsx`, reading the tree through `presentation/lib/page-tree.ts`.
No registry: the folders are the list, and the sitemap is built from the same read.

**A new route file is forbidden** — `scripts/check-routes.mjs` (first command of `npm run build`) fails on any route
file outside its closed list. Measured here: 300 page files built in 1252 s, the same 300 pages through one template
in 98 s; 300 page folders × 2 languages with only `en` prerendered — 73 s, the first visit of an unrendered page
0.67 s, every later one 0.008 s. `PRERENDER_LANGS` narrows what the build draws. Skill: `.claude/skills/use-page-tree`
(the master copy; the core carries a copy). The demo collection `guide` is `"index": false` — not in search.

## Run

`npm install` · `npm run build` · `npm start` (env from `.env`: `PORT`, `SERVICE_BIND`, `SERVICE_PUBLIC_URL`; the node
installer writes it).

## What it does not do yet

- 17 blocks are in the registry: the landing set (metrics, badges, cards, card, flow, h3, p, section-head, page-body,
  typography, tone, inline), breadcrumbs, faq, app-dialog, dialog-sample, section-separator; moving the rest of the
  68 blocks of the core is the next part of step 297. The showcase («Витрина») is not built yet.
- No public address yet (`blocks.<zone>` through the tunnel) — today it answers on the node machine only.
- No A2A, no M2M, no agent.

## What proves it

Official MCP client (`@modelcontextprotocol/sdk` 1.29) against a running server: 4 tools listed; `search_blocks dialog`
→ `app-dialog, dialog-sample`; `get_block dialog-sample` → one file, dependency `@fractera/app-dialog`;
`get_block nope` → an error, not a crash. API: `/r/registry.json` → 3 items; `/r/nope.json` → 404.

License: MIT.
