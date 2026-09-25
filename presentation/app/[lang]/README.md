# `/[lang]` — the public home page of the element «Blocks»

The home page of every AGI ITEM is **public and indexable** (owner, 2026-09-25); everything deeper is behind sign-in.

## What is here

| Path | Role |
|---|---|
| `page.tsx` | thin entry: re-exports static params, metadata and the page |
| `_data/body.ts` | every word of the page, en + ru: title, description, metrics, badges, cards, steps, crumbs, 3 FAQ |
| `_components/index.tsx` | assembles the body from registry blocks through `PageBody` + the set of blocks this page uses |
| `_components/meta.ts` | static params (en, ru), metadata: robots, canonical/hreflang/markdown alternate — only with a real https address |
| `index.md/route.ts` | the machine twin for agents, built from the same words |
| `../robots.ts`, `../sitemap.ts` | search signals; the sitemap is empty until the element has a real address |

Blocks come from `registry/src/` of this repository (tsconfig fallback `@/* → ../registry/src/*`) — the same files the
registry serves to other projects. Breadcrumbs and FAQ follow the **project settings**: flags come with the project
shell (`features.breadcrumbs`, `features.faq`), default on, cached for minutes.

## Languages

`en` and `ru`; another language → 404. Every visible string lives in `_data/body.ts`.

## Search engines and AI agents

`<title>`, `description`, `robots: index, follow`, `og:*`; `BreadcrumbList` and `FAQPage` JSON-LD are emitted by the
blocks that draw them (one source for the person and the machine); `/<lang>/index.md`. `canonical`, `hreflang`, the
markdown alternate and the sitemap appear only with `SERVICE_PUBLIC_URL` on https — a loopback address would be a lie.

## Build cost

1. The page text is code (`_data/body.ts`): a text edit costs a rebuild of this element only (`deploy-elements blocks`),
   never of the core or other elements.
2. The header, footer and the crumbs/FAQ switches are read at run time from the site shell inside `'use cache'` +
   `cacheLife('minutes')` — a menu or settings change on the site reaches this page with no build.
3. No file-system reads from `process.cwd()` in page code.
4. Guard first, build second: `npm run build` fails loudly on a block that is not in the set (`PageBody`).

## Caching (Next 16)

`cacheComponents: true` (next.config.ts). No segment config (`dynamic`, `revalidate`, `dynamicParams`). Shell and
features — cached functions, `cacheLife('minutes')`; the footer's year renders inside the cache. No request data on
this page. Measured: build table `◐ /[lang]` with `/en`, `/ru` fully prerendered (`x-nextjs-cache: HIT`), `●
/[lang]/index.md`, `○ /robots.txt`, `○ /sitemap.xml`.
