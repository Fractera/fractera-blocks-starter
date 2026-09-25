// ДЕРЕВО СТРАНИЦ — ПАПКА НА СТРАНИЦУ, ОДИН ШАБЛОН НА ВСЕ (шаг 298, 2026-09-25).
//
// Измерено на этом сервисе: 300 страниц отдельными файлами `page.tsx` собирались 1252 с, те же 300 страниц одним
// шаблоном — 98 с. Цену создаёт число ФАЙЛОВ-МАРШРУТОВ: каждый Next компилирует и проверяет отдельно со всеми
// импортами. Поэтому страница — это ПАПКА С ДАННЫМИ, а маршрут у всех страниц один:
// `app/[lang]/[collection]/[[...slug]]/page.tsx`. Навык — `.claude/skills/use-page-tree`.
//
//   content/<коллекция>/_collection.json   — { "titles": { "en": …, "ru": … }, "index": true|false }
//   content/<коллекция>/<slug>/meta.json   — { "order": 10, "index": true|false }
//   content/<коллекция>/<slug>/<lang>.json — { "title": …, "lead": …, "blocks": [ блоки каталога ] }
//   (вложенность разрешена: <slug>/<под>/meta.json → адрес /<lang>/<коллекция>/<slug>/<под>)
//
// 🔒 РЕЕСТРА НЕТ: список страниц — это сами папки. Добавил папку — страница появилась с адресом, в оглавлении и в
// sitemap; удалил — исчезла отовсюду. Забыть строку негде.
// 🔒 ТЕКСТЫ — ДАННЫЕ, А НЕ КОД: `<lang>.json` читается при отрисовке и не входит в сборку. Импортируй тексты модулями —
// 600 страниц × 82 языка раздули бы компиляцию так же, как 600 файлов маршрутов.
// 🔒 Всё чтение — внутри `'use cache'` с меткой `PAGE_TREE_TAG`: правка файла видна после `revalidateTag` или срока.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { cacheLife, cacheTag } from 'next/cache'
import type { Block } from '@/lib/content/blocks/types'

export const PAGE_TREE_TAG = 'page-tree'

export type PageWords = { title: string; lead?: string; blocks?: Block[] }
export type TreePage = { collection: string; slug: string[]; order: number; index: boolean; langs: string[] }
export type TreeCollection = { id: string; titles: Record<string, string>; index: boolean; pages: TreePage[] }

// Папку называет `server.js` (`PAGE_TREE_DIR`); без него — от рабочей папки сборки. `turbopackIgnore`: путь от
// рабочей папки иначе затягивает в трассировку сборки весь проект.
function root(): string {
  if (process.env.PAGE_TREE_DIR) return process.env.PAGE_TREE_DIR
  const inRepo = join(/*turbopackIgnore: true*/ process.cwd(), 'presentation', 'content')
  return existsSync(inRepo) ? inRepo : join(/*turbopackIgnore: true*/ process.cwd(), 'content')
}

const readJson = <T,>(file: string): T | null => {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T
  } catch {
    return null
  }
}
const SEGMENT = /^[a-z0-9][a-z0-9-]*$/
const LANG_FILE = /^([a-z]{2})\.json$/

function walk(dir: string, collection: string, slug: string[], collectionIndex: boolean, out: TreePage[]) {
  for (const name of readdirSync(dir)) {
    const sub = join(dir, name)
    if (!SEGMENT.test(name) || !statSync(sub).isDirectory()) continue
    const path = [...slug, name]
    const meta = readJson<{ order?: number; index?: boolean }>(join(sub, 'meta.json'))
    if (meta) {
      const langs = readdirSync(sub).map((f) => LANG_FILE.exec(f)?.[1]).filter((l): l is string => !!l).sort()
      out.push({ collection, slug: path, order: meta.order ?? 0, index: collectionIndex && meta.index !== false, langs })
    }
    walk(sub, collection, path, collectionIndex, out)
  }
}

/** Всё дерево: коллекции и их страницы, по порядку. Реестра нет — это чтение папок. */
export async function pageTree(): Promise<TreeCollection[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(PAGE_TREE_TAG)
  const base = root()
  if (!existsSync(base)) return []
  const out: TreeCollection[] = []
  for (const id of readdirSync(base).sort()) {
    const dir = join(base, id)
    if (!SEGMENT.test(id) || !statSync(dir).isDirectory()) continue
    const c = readJson<{ titles?: Record<string, string>; index?: boolean }>(join(dir, '_collection.json')) ?? {}
    const pages: TreePage[] = []
    walk(dir, id, [], c.index !== false, pages)
    pages.sort((a, b) => a.order - b.order || a.slug.join('/').localeCompare(b.slug.join('/')))
    out.push({ id, titles: c.titles ?? {}, index: c.index !== false, pages })
  }
  return out
}

/** Слова одной страницы на одном языке — или `null`, если такой страницы или такого языка нет. */
export async function pageWords(collection: string, slug: string[], lang: string): Promise<PageWords | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(PAGE_TREE_TAG)
  if (!SEGMENT.test(collection) || !slug.every((s) => SEGMENT.test(s)) || !/^[a-z]{2}$/.test(lang)) return null
  return readJson<PageWords>(join(root(), collection, ...slug, `${lang}.json`))
}

/** Какие адреса предрендерить при сборке. Остальные рисуются при первом заходе и сохраняются (Next 16, Cache
 * Components). `PRERENDER_LANGS` сужает срез: при 600 страницах × 82 языках в сборку идут, скажем, en и ru. */
export async function prerenderSlice(siteLangs: string[]): Promise<{ lang: string; collection: string; slug?: string[] }[]> {
  const only = (process.env.PRERENDER_LANGS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const langs = only.length ? siteLangs.filter((l) => only.includes(l)) : siteLangs
  const out: { lang: string; collection: string; slug?: string[] }[] = []
  for (const c of await pageTree()) {
    for (const lang of langs) {
      out.push({ lang, collection: c.id, slug: [] })
      for (const p of c.pages) if (p.langs.includes(lang)) out.push({ lang, collection: c.id, slug: p.slug })
    }
  }
  return out
}
