import { notFound } from 'next/navigation'
import { cacheLife } from 'next/cache'
import { H1, Lead } from '@/components/ui/typography'
import { PageBody, type BlockData } from '@/components/blocks/page-body'
import { Metrics } from '@/components/blocks/metrics'
import { Badges } from '@/components/blocks/badges'
import { Cards } from '@/components/blocks/cards'
import { Card } from '@/components/blocks/card'
import { Flow } from '@/components/blocks/flow'
import { H3 } from '@/components/blocks/h3'
import { P } from '@/components/blocks/p'
import { Breadcrumbs } from '@/components/blocks/breadcrumbs'
import { Faq } from '@/components/blocks/faq'
import { ShowcaseFrame } from '@/components/blocks/showcase-frame'
import SECTIONS from '@/sections/SECTIONS.json'
import { loadProjectShell } from '@/components/shell/remote-shell'
import { blocksHomeWords, LANGS, type BlocksHomeWords } from '../_data/body'
import { withTerminal } from '../_data/terminal'
import { PUBLIC_BASE } from './meta'

// СБОРКА ГЛАВНОЙ ИЗ БЛОКОВ РЕЕСТРА ЭТОГО ЭЛЕМЕНТА (одна копия кода: `registry/src/` — и витрина, и реестр).
// 🛑 СЛОВА ОТСЮДА НЕ ПИШУТСЯ — `../_data/body.ts`.
const SET = { metrics: Metrics, badges: Badges, cards: Cards, card: Card, flow: Flow, h3: H3, p: P }
const SITE = (process.env.PROJECT_SITE_URL ?? '').replace(/\/+$/, '')

// Крошки и FAQ включает НАСТРОЙКА ПРОЕКТА (слово владельца 2026-09-25): флаги приходят с оболочкой сайта и держатся
// в кэше минуты. Сайт их ещё не отдаёт — тогда действует умолчание его настроек: оба включены.
async function projectFeatures(lang: string): Promise<{ breadcrumbs: boolean; faq: boolean }> {
  'use cache'
  cacheLife('minutes')
  const shell = (await loadProjectShell(lang)) as unknown as { features?: { breadcrumbs?: boolean; faq?: boolean } } | null
  return { breadcrumbs: shell?.features?.breadcrumbs ?? true, faq: shell?.features?.faq ?? true }
}

function body(w: BlocksHomeWords): BlockData[] {
  const cardsOf = (items: { title: string; text: string }[]): BlockData[] =>
    items.map((i) => ({ kind: 'card', children: [{ kind: 'h3', text: i.title }, { kind: 'p', text: i.text }] }))
  return [
    { kind: 'metrics', items: w.metrics },
    { kind: 'badges', items: w.badges.map((label) => ({ label, tone: 'code' })) },
    { kind: 'cards', badge: w.why.badge, title: w.why.title, note: w.why.note, cols: 3, children: cardsOf(w.why.items) },
    { kind: 'cards', badge: w.who.badge, title: w.who.title, note: w.who.note, cols: 3, children: cardsOf(w.who.items) },
    {
      kind: 'cards', badge: w.custom.badge, title: w.custom.title, note: w.custom.note, cols: 2,
      children: [
        { kind: 'card', tone: 'data', children: [{ kind: 'h3', text: w.custom.block.title }, { kind: 'p', text: w.custom.block.text }] },
        { kind: 'card', tone: 'access', children: [{ kind: 'h3', text: w.custom.widget.title }, { kind: 'p', text: w.custom.widget.text }] },
      ],
    },
    { kind: 'flow', badge: w.choose.badge, title: w.choose.title, note: w.choose.note, steps: w.choose.steps },
  ]
}

// 300: «как менять дизайн блоков» — агент ядра; адрес терминала — `../_data/terminal.ts`.
function agentBody(w: BlocksHomeWords, lang: string): BlockData[] {
  const a = w.agent
  return [
    {
      kind: 'flow', badge: a.badge, title: a.title, note: withTerminal(a.note, lang),
      steps: a.steps.map((s) => ({ title: s.title, text: withTerminal(s.text, lang) })),
    },
    {
      kind: 'cards', badge: a.scenarios.badge, title: a.scenarios.title, note: a.scenarios.note, cols: 3,
      children: a.scenarios.items.map((i) => ({ kind: 'card', children: [{ kind: 'h3', text: i.title }, { kind: 'p', text: i.text }] })),
    },
  ]
}

export default async function BlocksHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!LANGS.includes(lang)) notFound()
  const w = blocksHomeWords(lang)
  const features = await projectFeatures(lang)
  return (
    <main data-app-column className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      {features.breadcrumbs && (
        <Breadcrumbs items={[{ label: w.crumbs.site, href: SITE ? `${SITE}/${lang}` : undefined }, { label: w.crumbs.blocks, href: PUBLIC_BASE ? `${PUBLIC_BASE}/${lang}` : undefined }]} />
      )}
      <H1 className="mt-6">{w.title}</H1>
      <Lead className="mt-4 max-w-3xl">{w.description}</Lead>
      <PageBody blocks={body(w)} set={SET} />
      <ShowcaseFrame
        id="showcase"
        badge={w.showcase.badge}
        title={w.showcase.title}
        note={w.showcase.note}
        menuTitle={w.showcase.menuTitle}
        frameTitle={w.showcase.frameTitle}
        items={(SECTIONS.types as { id: string; order: number; title: Record<string, string> }[])
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((t) => ({ id: t.id, label: t.title[lang] ?? t.title.en, href: `/showcase/${lang}/${t.id}` }))}
      />
      <PageBody blocks={agentBody(w, lang)} set={SET} />
      {features.faq && <Faq title={w.faqTitle} items={w.faq} />}
    </main>
  )
}
