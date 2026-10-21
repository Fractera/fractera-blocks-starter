import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostBody } from '@reg/components/content-page/post-body'
import { H1, Lead } from '@/components/ui/typography'
import { guideTree, pageWords, type PageWords } from '../_libs/page-tree'

// 549-3: «Руководство» элемента «Блоки» — `/<язык>/guide` и `/<язык>/guide/<страница>`, как у прежнего сайта
// (`presentation/app/[lang]/[collection]/[[...slug]]/page.tsx` blocks v0.5.24). Коллекция закрыта поисковику (`index: false`).
export const LANGS = ['en', 'ru']
const addressOf = (lang: string, slug?: string) => `/${lang}/guide${slug ? `/${slug}` : ''}`

/** Языки, на которых страница существует, — для `buildAlternates` в файле страницы (сторож SEO ищет вызов там). */
export function guideLangs(slug?: string): string[] {
  return slug ? (guideTree()?.pages.find((x) => x.slug.join('/') === slug)?.langs ?? []) : LANGS
}

export function guideMetadata(lang: string, slug?: string): Metadata {
  const c = guideTree()
  const words = slug ? pageWords([slug], lang) : null
  const title = words?.title ?? c?.titles[lang] ?? c?.titles.en ?? 'Guide'
  return { title, description: words?.lead, robots: { index: false, follow: false } }
}

export function GuideIndex({ lang }: { lang: string }) {
  const c = guideTree()
  if (!LANGS.includes(lang) || !c) notFound()
  const items = c.pages.filter((x) => x.langs.includes(lang)).map((x) => ({ x, w: pageWords(x.slug, lang) }))
  return (
    <div data-block="gd0a1" className="mx-auto w-full max-w-5xl px-6 py-10">
      <H1>{c.titles[lang] ?? c.titles.en ?? c.id}</H1>
      <ul data-block="gd0a2" className="mt-8 flex flex-col gap-4">
        {items.map(({ x, w }) => (
          <li key={x.slug.join('/')} className="rounded-xl border border-border bg-card p-4">
            <Link href={addressOf(lang, x.slug.join('/'))} className="font-medium text-primary hover:underline">
              {w?.title ?? x.slug.join('/')}
            </Link>
            {w?.lead && <Lead className="mt-1">{w.lead}</Lead>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function guideWords(lang: string, slug: string): PageWords {
  const c = guideTree()
  if (!LANGS.includes(lang) || !c || !c.pages.some((x) => x.slug.join('/') === slug && x.langs.includes(lang))) notFound()
  const words = pageWords([slug], lang)
  if (!words) notFound()
  return words
}

export function GuidePage({ lang, slug }: { lang: string; slug: string }) {
  const words = guideWords(lang, slug)
  return (
    <div data-block="gd0a3" className="mx-auto w-full max-w-5xl px-6 py-10">
      <H1>{words.title}</H1>
      {words.lead && <Lead className="mt-3">{words.lead}</Lead>}
      <div data-block="gd0a4" className="mt-8">
        <PostBody blocks={words.blocks ?? []} lang={lang} />
      </div>
    </div>
  )
}

/** Markdown-копия страницы для агентов: блоки прежнего формата (h2, p, list, code, quote) — в разметку. */
export function guideMarkdown(lang: string, slug?: string): string {
  const c = guideTree()
  if (!slug) {
    const items = (c?.pages ?? []).filter((x) => x.langs.includes(lang)).map((x) => ({ x, w: pageWords(x.slug, lang) }))
    return [`# ${c?.titles[lang] ?? c?.titles.en ?? 'Guide'}`, '', ...items.map(({ x, w }) => `- [${w?.title ?? x.slug.join('/')}](${addressOf(lang, x.slug.join('/'))})${w?.lead ? ` — ${w.lead}` : ''}`), ''].join('\n')
  }
  const w = pageWords([slug], lang)
  if (!w) return ''
  const out = [`# ${w.title}`, '']
  if (w.lead) out.push(w.lead, '')
  for (const b of (w.blocks ?? []) as Array<{ kind: string; text?: string; items?: string[] }>) {
    if (b.kind === 'h2') out.push(`## ${b.text}`, '')
    else if (b.kind === 'h3') out.push(`### ${b.text}`, '')
    else if (b.kind === 'list') out.push((b.items ?? []).map((i) => `- ${i}`).join('\n'), '')
    else if (b.kind === 'code') out.push('```', b.text ?? '', '```', '')
    else if (b.kind === 'quote') out.push(`> ${b.text}`, '')
    else if (b.text) out.push(b.text, '')
  }
  return out.join('\n')
}
