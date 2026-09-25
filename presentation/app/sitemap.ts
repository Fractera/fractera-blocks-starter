import type { MetadataRoute } from 'next'
import { PUBLIC_BASE } from './[lang]/_components/meta'
import { LANGS } from './[lang]/_data/body'
import { pageTree } from '@/lib/page-tree'

// Карта сайта — только с настоящим адресом: адрес петли машины поисковику не нужен.
// 298: страницы дерева приходят из того же чтения папок, что и маршрут, — отдельного списка для карты нет.
// В карту идут только коллекции и страницы с `index: true`, и у каждой — только те языки, на которых она есть.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!PUBLIC_BASE) return []
  const home = LANGS.map((lang) => ({
    url: `${PUBLIC_BASE}/${lang}`,
    alternates: { languages: Object.fromEntries(LANGS.map((l) => [l, `${PUBLIC_BASE}/${l}`])) },
  }))
  const tree = (await pageTree()).filter((c) => c.index)
  const collections = tree.flatMap((c) =>
    LANGS.map((lang) => ({
      url: `${PUBLIC_BASE}/${lang}/${c.id}`,
      alternates: { languages: Object.fromEntries(LANGS.map((l) => [l, `${PUBLIC_BASE}/${l}/${c.id}`])) },
    })),
  )
  const pages = tree.flatMap((c) =>
    c.pages
      .filter((p) => p.index)
      .flatMap((p) =>
        p.langs.map((lang) => ({
          url: `${PUBLIC_BASE}/${lang}/${c.id}/${p.slug.join('/')}`,
          alternates: { languages: Object.fromEntries(p.langs.map((l) => [l, `${PUBLIC_BASE}/${l}/${c.id}/${p.slug.join('/')}`])) },
        })),
      ),
  )
  return [...home, ...collections, ...pages]
}
