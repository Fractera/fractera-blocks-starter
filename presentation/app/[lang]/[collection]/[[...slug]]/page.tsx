// ЕДИНСТВЕННЫЙ ШАБЛОН ВСЕХ СТРАНИЦ ДЕРЕВА (шаг 298). Страница — это папка `content/<коллекция>/<slug>/`, а не файл
// здесь: новый раздел или новая страница НЕ получают своего `page.tsx` (сторож `scripts/check-routes.mjs` уронит
// сборку). `/<lang>/<коллекция>` — оглавление коллекции, `/<lang>/<коллекция>/<slug…>` — страница.
//
// Предрендер — срез из `prerenderSlice` (все языки или `PRERENDER_LANGS`); адрес вне среза рисуется при первом заходе и
// сохраняется (Next 16.2, dynamic-routes.md «With Cache Components»). Страница остаётся статической: у неё свой адрес,
// готовый HTML и canonical/hreflang — динамический здесь только сегмент адреса, а не отрисовка.
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostBody } from '@/components/content-page/post-body'
import { pageTree, pageWords, prerenderSlice, type TreeCollection } from '@/lib/page-tree'
import { PUBLIC_BASE } from '../../_components/meta'
import { LANGS } from '../../_data/body'

type Params = { lang: string; collection: string; slug?: string[] }

export async function generateStaticParams(): Promise<Params[]> {
  const slice = await prerenderSlice(LANGS)
  // Next 16 с Cache Components требует хотя бы один параметр; пустое дерево отвечает 404 по этому образцу.
  return slice.length ? slice : [{ lang: LANGS[0], collection: '__empty__', slug: [] }]
}

async function find(p: Params): Promise<{ c: TreeCollection; slug: string[] } | null> {
  if (!LANGS.includes(p.lang)) return null
  const c = (await pageTree()).find((x) => x.id === p.collection)
  if (!c) return null
  const slug = p.slug ?? []
  if (slug.length && !c.pages.some((x) => x.slug.join('/') === slug.join('/') && x.langs.includes(p.lang))) return null
  return { c, slug }
}

function addressOf(lang: string, collection: string, slug: string[]) {
  return `/${lang}/${collection}${slug.length ? `/${slug.join('/')}` : ''}`
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = await params
  const hit = await find(p)
  if (!hit) return { title: 'Not found', robots: { index: false, follow: false } }
  const { c, slug } = hit
  const page = slug.length ? c.pages.find((x) => x.slug.join('/') === slug.join('/')) : null
  const words = slug.length ? await pageWords(c.id, slug, p.lang) : null
  const title = words?.title ?? c.titles[p.lang] ?? c.titles.en ?? c.id
  const index = page ? page.index : c.index
  // hreflang — только языки, на которых страница ДЕЙСТВИТЕЛЬНО есть: ссылка на несуществующий перевод — ложь поисковику.
  const langs = page ? page.langs : LANGS
  return {
    title,
    description: words?.lead,
    robots: { index, follow: index },
    ...(PUBLIC_BASE && index
      ? {
          metadataBase: new URL(PUBLIC_BASE),
          alternates: {
            canonical: `${PUBLIC_BASE}${addressOf(p.lang, c.id, slug)}`,
            languages: Object.fromEntries(langs.map((l) => [l, `${PUBLIC_BASE}${addressOf(l, c.id, slug)}`])),
          },
        }
      : {}),
  }
}

export default async function TreePage({ params }: { params: Promise<Params> }) {
  const p = await params
  const hit = await find(p)
  if (!hit) notFound()
  const { c, slug } = hit

  if (!slug.length) {
    const items = await Promise.all(
      c.pages
        .filter((x) => x.langs.includes(p.lang))
        .map(async (x) => ({ x, w: await pageWords(c.id, x.slug, p.lang) })),
    )
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">{c.titles[p.lang] ?? c.titles.en ?? c.id}</h1>
        <ul className="mt-8 flex flex-col gap-4">
          {items.map(({ x, w }) => (
            <li key={x.slug.join('/')} className="rounded-xl border border-border bg-card p-4">
              <Link href={addressOf(p.lang, c.id, x.slug)} className="font-medium text-primary hover:underline">
                {w?.title ?? x.slug.join('/')}
              </Link>
              {w?.lead && <p className="mt-1 text-sm text-muted-foreground">{w.lead}</p>}
            </li>
          ))}
        </ul>
      </main>
    )
  }

  const words = await pageWords(c.id, slug, p.lang)
  if (!words) notFound()
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{words.title}</h1>
      {words.lead && <p className="mt-3 text-lg text-muted-foreground">{words.lead}</p>}
      <div className="mt-8">
        <PostBody blocks={words.blocks ?? []} lang={p.lang} />
      </div>
    </main>
  )
}
