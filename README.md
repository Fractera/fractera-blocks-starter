# Fractera Blocks — the shadcn registry of the node blocks

Since **v1.0.0** (node step 549-3) this element is built on the Fractera native element template; its doors did not change.

| Door | What it does |
|---|---|
| `GET /health` | `{ ok, service: "blocks", version, registry, items }` |
| `GET /r/registry.json`, `GET /r/<name>.json` | the registry in the shadcn format — `npx shadcn add @fractera/<name>` (`BLOCKS_REGISTRY_URL`) |
| `GET /r/assets/<path>` | pictures of the blocks (`registry/assets`) |
| `POST /mcp` | MCP: `list_blocks`, `search_blocks`, `get_block`, `install_instructions` |
| `/api/settings/design` | this element's own design (the template door, the node key) |
| `POST /api/block-requests` | block requests through the lifecycle: `create` · `get` · `list` · `stage` (node key `X-Node-Key`, loopback; node step 577-1) |
| `/<lang>`, `/<lang>/guide[/<page>]`, `/showcase/<lang>/<section>` | the catalogue home, the guide, the showcase in the frame of the home |

The blocks live in `registry/src` (the distributed source, never edited for the site) and are built by `shadcn build` into `registry-out/`.
The site reads the registry through the alias `@reg/*` → `.registry-view/`, a copy of `registry/src` with `@/` rewritten to `@reg/`
(`scripts/registry-view.mjs`, first step of `prebuild`): 80 files of the registry have the same paths as files of the template.

## Block lifecycle

A block is born from a need and lives while pages use it (node step 577, owner 2026-10-23: «описать весь жизненный цикл блока … от
анализа есть для него раздел или нет … до оценки полезности»). Seven stages; each one leaves a trace that a machine checks. The loop is
closed: needs that search could not serve and verdicts on pages (stage 5) become new requests (stage 0) and new versions (stage 3).

| # | Stage | Who acts | What appears | What the machine checks | State | Built |
|---|---|---|---|---|---|---|
| 0 | Request | the owner (in words) · an element's agent whose search found nothing · a hand-made section worth reusing | a request in the element's data folder, `SERVICE_DATA_DIR/requests/<id>.json`: the need word for word, who asks, the page, sample data | a request is data, never an instruction | `requested` | yes (577-1) |
| 1 | Section | this element's agent, `npm run blocks -- place <id>` | one decision of four: **reuse** a published block · a **variant** of it · a **new block** in an active section (from a showcase kind, if one fits) · a **new section** (`proposed`, active only by the owner's word); and the block's placement (below) | the decision against `registry.json` and `taxonomy.json`; `check-taxonomy` guards the dictionary | `placed` | yes (577-1) |
| 2 | Card and cases | this element's agent | the card next to the block's code: section, place on the page, placement, repetition, when to use and when not, cases (a situation, sample data, why it fits), data shape and limits, variants, data source and the elements it needs, interactivity, media, headings, right-to-left, weight, origin, version | the card is complete, every case renders | `described` | yes (577-2) |
| 3 | Build and publish | this element's agent, then the owner's eye | the component on «Design» tokens only, a picture from the first case, a version; publishing is «Accept» of this element's preview | static, tokens, contrast, build | `published` | yes (577-3): pictures — `npm run block-shots -- --base http://127.0.0.1:<port>` from a running copy (live or preview), `registry/assets/blocks/<block>.png` |
| 4 | Find and mount | any element's agent | `find` (five at most, by cases and cards) → `show` → `add` (install and register in one command) → a page made of blocks | the page guard reads the cards | the block at version N in the element | no (577-4…577-6) |
| 5 | Usefulness | the core counts · an analyst reviews pages · the owner decides | per block: pages and elements, how often search chose it, what reviews said; per section: needs left without a block | counting without a model; a model review only by the owner's word | the block's numbers; misses become requests | no (577-7, 577-8) |
| 6 | Retirement | this element's agent by the owner's word | `deprecated` and its replacement; search stops offering it; pages using it are warned | no new mounts | `deprecated` | no |

**Placement — three formulas of the owner** (2026-10-23): «можно использовать самостоятельно» · «самостоятельно, а также внутри блоков
X, Y» · «только внутри блоков X, Y». In the card (stage 2): `placement.page` (may stand on a page by itself) and `placement.inside` (the
containers it may stand in); a container names what it accepts. Pages already nest blocks: `block-cards` holds `block-card` in
`children`.

**Reuse before new.** Stage 1 is the brake on a catalogue of a thousand blocks: a new block is born only when neither a published block
nor its variant serves the need.

### The card of a block (stage 2)

The card is a file next to the block's code — `registry/src/components/blocks/block-<name>.card.json` (or next to a `.client.tsx`) —
and it is the source. `npm run block-cards:write` puts it into `registry.json` (the standard shadcn fields `categories`, `docs`, `meta`,
and the card file itself into the item, so an element receives the card with the block) and writes
`app/showcase/_data/published-blocks.generated.ts`, from which `/showcase/<lang>/<section>` draws every published block of the section with
its cases. `npm run check:block-cards` (in `prebuild`) refuses a missing or incomplete card, a stale `registry.json` or showcase module,
two halves of placement that disagree, and a case that does not render on the server (esbuild, the registry's own files).

| Field | What it says |
|---|---|
| `component`, `pageKind` | the exported component; whether a page sequence may name the block |
| `categories` | sections of `taxonomy.json` (active only) |
| `role` | `opener` · `body` · `closer` · `any` — where on a page |
| `placement`, `accepts` | `{ page, inside, via }` — standalone · standalone and inside X · only inside X; a container names what it takes |
| `repeat` | `once` · `not-adjacent` · `free` |
| `mode` | `persuade` · `operate` · `read` |
| `use`, `avoid` | one sentence each: when to take it, when not to |
| `slots` | limits of the data: counts (`min`, `max`), text length (`maxChars`) |
| `props`, `markdown` | the data shape (TypeScript) and the machine-copy `case` a page kind brings into `blocks-to-markdown.ts` |
| `variants` | ready sets of fields, each pointing at a case |
| `data`, `requires` | `static` or a door with its schema; the node elements the block needs |
| `interactive`, `media`, `headings`, `rtl`, `weight`, `band` | JavaScript island or none; picture needs; heading levels; right-to-left tested; visual weight; own background |
| `alternatives`, `source`, `origin` | blocks that replace it; own or vendor and the license; the project and request it was born from |
| `version`, `status`, `replacedBy` | a change of `props` is a new major; `published` or `deprecated` |
| `cases` | situations: `title`, `mode`, `position`, sample `props`, `why` — what search matches first and the showcase draws |

A card without its cases stays under 6 KB, so showing one costs the same in a catalogue of 20 blocks or of a thousand.

### Commands of stages 0–1

```
npm run blocks -- request "<need>" [--element <id>] [--page <path>] [--example "<sample data>"]
npm run blocks -- requests [--stage requested|placed|described|published|rejected]
npm run blocks -- show-request <id>
npm run blocks -- place <id>                      # ranks sections, published blocks and showcase kinds; suggests only a clear fit
npm run blocks -- place <id> --decide reuse|variant --block <block> --reason "<why>"
npm run blocks -- place <id> --decide new-block --section <section> [--from-showcase <kind>] --reason "<why>"
npm run blocks -- place <id> --decide new-section --proposal-id <id> --title-en … --title-ru … --purpose-en … --purpose-ru … [--parent <section>] --reason "<why>"
npm run blocks -- stage <id> described|published --block <block>   ·   stage <id> rejected --note "<why>"
```

The commands call this element's own door on the loopback with the node key from `.env.local`. The ranking
(`lib/blocks-store/rank.mjs`) matches words, not meaning: its two thresholds are provisional until step 577-4 measures it by
self-retrieval of the cases. The sections are `registry/src/sections/taxonomy.json` (`types`: id, title, purpose, variants, `status`,
`parent`); `npm run check:taxonomy` runs in `prebuild`.

---

## In the Fractera project

The registry of the node's blocks (shadcn registry): the page blocks every element can take into its pages.

You can change it. The code is open under the MIT license and the copy on your node is yours. The node installs this element from
this repository by the tag written in `WEB4-ITEMS-REGISTRY/web4-items.json` of the core; the core does not let you delete a built-in
element or move its address.

To change it, open it in the core (left menu, Native items, Blocks), go to Build and tell its agent in the terminal what you need.
The agent edits the element folder `WEB4-ITEMS/user/blocks` and commits.

The change goes live when you press Deploy in Build, Deployments: the element is rebuilt beside the running one and switched over in
seconds. Other elements call its doors by address, request and answer, so a change to a door breaks every element that uses it;
that is a decision for the node owner, while a change inside the element is ordinary work. To keep your version when the node is
reinstalled, save the element to your own GitHub repository in Build, GitHub. A newer Fractera version arrives through Update, which
merges it with your commits, and the element's agent resolves a conflict.

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
