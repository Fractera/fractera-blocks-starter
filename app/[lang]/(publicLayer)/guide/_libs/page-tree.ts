// 549-3: дерево страниц коллекции «Руководство» элемента «Блоки» — дословно `presentation/lib/page-tree.ts` blocks v0.5.24, кроме двух мест:
// данные — `content/guide/` в корне элемента (вне app/: формат блоков прежнего сайта, его рисует PostBody реестра; путь от ELEMENT_DIR — standalone-сервер делает chdir), и без `'use cache'`
// (в шаблоне нет cacheComponents; страницы статические — сборка и ISR).
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { Block } from '@reg/lib/content/blocks/types'

export type PageWords = { title: string; lead?: string; blocks?: Block[] }
export type TreePage = { collection: string; slug: string[]; order: number; index: boolean; langs: string[] }
export type TreeCollection = { id: string; titles: Record<string, string>; index: boolean; pages: TreePage[] }

const COLLECTION = 'guide'
const root = () => join(/*turbopackIgnore: true*/ process.env.ELEMENT_DIR || process.cwd(), 'content', 'guide')

const readJson = <T,>(file: string): T | null => {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T
  } catch {
    return null
  }
}
const SEGMENT = /^[a-z0-9][a-z0-9-]*$/
const LANG_FILE = /^([a-z]{2})\.json$/

function walk(dir: string, slug: string[], collectionIndex: boolean, out: TreePage[]) {
  for (const name of readdirSync(dir)) {
    const sub = join(dir, name)
    if (!SEGMENT.test(name) || !statSync(sub).isDirectory()) continue
    const path = [...slug, name]
    const meta = readJson<{ order?: number; index?: boolean }>(join(sub, 'meta.json'))
    if (meta) {
      const langs = readdirSync(sub).map((f) => LANG_FILE.exec(f)?.[1]).filter((l): l is string => !!l).sort()
      out.push({ collection: COLLECTION, slug: path, order: meta.order ?? 0, index: collectionIndex && meta.index !== false, langs })
    }
    walk(sub, path, collectionIndex, out)
  }
}

/** Коллекция «Руководство»: заголовки и страницы по порядку. Реестра нет — это чтение папок. */
export function guideTree(): TreeCollection | null {
  const base = root()
  if (!existsSync(base)) return null
  const c = readJson<{ titles?: Record<string, string>; index?: boolean }>(join(base, '_collection.json')) ?? {}
  const pages: TreePage[] = []
  walk(base, [], c.index !== false, pages)
  pages.sort((a, b) => a.order - b.order || a.slug.join('/').localeCompare(b.slug.join('/')))
  return { id: COLLECTION, titles: c.titles ?? {}, index: c.index !== false, pages }
}

/** Слова одной страницы на одном языке — или `null`, если такой страницы или такого языка нет. */
export function pageWords(slug: string[], lang: string): PageWords | null {
  if (!slug.every((s) => SEGMENT.test(s)) || !/^[a-z]{2}$/.test(lang)) return null
  return readJson<PageWords>(join(root(), ...slug, `${lang}.json`))
}
