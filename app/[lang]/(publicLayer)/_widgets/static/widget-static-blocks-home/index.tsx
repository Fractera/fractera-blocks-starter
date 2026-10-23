import { HeroCentered } from '@reg/components/blocks/block-hero-centered'
import { PageBody, type BlockData } from '@reg/components/blocks/page-body'
import { Metrics } from '@reg/components/blocks/block-metrics'
import { Badges } from '@reg/components/blocks/block-badges'
import { Cards } from '@reg/components/blocks/block-cards'
import { Card } from '@reg/components/blocks/block-card'
import { Flow } from '@reg/components/blocks/block-flow'
import { Breadcrumbs } from '@reg/components/blocks/block-breadcrumbs'
import { Faq } from '@reg/components/blocks/block-faq'
import { SectionHead } from '@reg/components/blocks/block-section-head'
import { catalogueRows, catalogueCounts } from '@/app/showcase/_data/catalogue-rows'
import { CatalogueTable } from './catalogue-table.client'
import { TEXT_SET } from './text-set'
import { loadProjectShell } from './shell/remote-shell'
import { blocksHomeWords, type BlocksHomeWords } from './body.i18n'
import { withTerminal } from './terminal'

// ГЛАВНАЯ ЭЛЕМЕНТА «БЛОКИ» (549-3) — дословно `presentation/app/[lang]/_components/index.tsx` blocks v0.5.24: главная собирается из блоков
// САМОГО РЕЕСТРА (одна копия кода — `registry/src/`, здесь через `@reg/` → `.registry-view/`, `scripts/registry-view.mjs`).
// Отличия от прежней: без `'use cache'` (в шаблоне нет cacheComponents — оболочка читается при сборке и перерисовке страницы);
// язык приходит аргументом виджета, а не параметром маршрута. Слова — `./body.i18n.ts`.
const SET = { 'block-metrics': Metrics, 'block-badges': Badges, 'block-cards': Cards, 'block-card': Card, 'block-flow': Flow, ...TEXT_SET }
const SITE = (process.env.PROJECT_SITE_URL ?? '').replace(/\/+$/, '')
const PUBLIC = (process.env.SERVICE_PUBLIC_URL ?? '').replace(/\/+$/, '')
const PUBLIC_BASE = /^https:\/\//.test(PUBLIC) && !/localhost|127\.0\.0\.1/.test(PUBLIC) ? PUBLIC : ''

// Крошки и FAQ включает НАСТРОЙКА ПРОЕКТА (слово владельца 2026-09-25): флаги приходят с оболочкой сайта. Сайт их не отдаёт —
// действует умолчание его настроек: оба включены.
async function projectFeatures(lang: string): Promise<{ breadcrumbs: boolean; faq: boolean }> {
  const shell = (await loadProjectShell(lang)) as unknown as { features?: { breadcrumbs?: boolean; faq?: boolean } } | null
  return { breadcrumbs: shell?.features?.breadcrumbs ?? true, faq: shell?.features?.faq ?? true }
}

function body(w: BlocksHomeWords): BlockData[] {
  const counts = catalogueCounts()
  const cardsOf = (items: { title: string; text: string }[]): BlockData[] =>
    items.map((i) => ({ kind: 'block-card', children: [{ kind: 'text-h3', text: i.title }, { kind: 'text-p', text: i.text }] }))
  return [
    // 577-10 (владелец 2026-10-23: «информация на landing которые описывает количество блоков … должна автоматически изменять количество
    // записей»): числа считаются из того же списка, что строки таблицы.
    { kind: 'block-metrics', items: w.metrics.map((m) => ({ ...m, value: m.value.replace('{rows}', String(counts.rows)).replace('{sections}', String(counts.sections)) })) },
    { kind: 'block-badges', items: w.badges.map((label) => ({ label, tone: 'code' })) },
    { kind: 'block-cards', badge: w.why.badge, title: w.why.title, note: w.why.note, cols: 3, children: cardsOf(w.why.items) },
    { kind: 'block-cards', badge: w.who.badge, title: w.who.title, note: w.who.note, cols: 3, children: cardsOf(w.who.items) },
    {
      kind: 'block-cards', badge: w.custom.badge, title: w.custom.title, note: w.custom.note, cols: 2,
      children: [
        { kind: 'block-card', tone: 'data', children: [{ kind: 'text-h3', text: w.custom.block.title }, { kind: 'text-p', text: w.custom.block.text }] },
        { kind: 'block-card', tone: 'access', children: [{ kind: 'text-h3', text: w.custom.widget.title }, { kind: 'text-p', text: w.custom.widget.text }] },
      ],
    },
    { kind: 'block-flow', badge: w.choose.badge, title: w.choose.title, note: w.choose.note, steps: w.choose.steps },
  ]
}

// 300: «как менять дизайн блоков» — агент ядра; адрес терминала — `./terminal.ts`.
function agentBody(w: BlocksHomeWords, lang: string): BlockData[] {
  const a = w.agent
  return [
    {
      kind: 'block-flow', badge: a.badge, title: a.title, note: withTerminal(a.note, lang),
      steps: a.steps.map((s) => ({ title: s.title, text: withTerminal(s.text, lang) })),
    },
    {
      kind: 'block-cards', badge: a.scenarios.badge, title: a.scenarios.title, note: a.scenarios.note, cols: 3,
      children: a.scenarios.items.map((i) => ({ kind: 'block-card', children: [{ kind: 'text-h3', text: i.title }, { kind: 'text-p', text: i.text }] })),
    },
  ]
}

export async function BlocksHome({ lang }: { lang: string }) {
  const w = blocksHomeWords(lang)
  const features = await projectFeatures(lang)
  return (
    // 307: первый экран шире колонки страницы (до 1250px) — стоит вне её; крошки и содержимое — в колонке, как были.
    <div data-block="bh0a1" className="w-full flex-1 pt-10">
      <div data-block="bh0a2" data-app-column className="mx-auto w-full max-w-5xl px-6">
        {features.breadcrumbs && (
          <Breadcrumbs items={[{ label: w.crumbs.site, href: SITE ? `${SITE}/${lang}` : undefined }, { label: w.crumbs.blocks, href: PUBLIC_BASE ? `${PUBLIC_BASE}/${lang}` : undefined }]} />
        )}
      </div>
      <HeroCentered pill={w.pill} title={w.title} description={w.description} cta={w.cta} steps={w.heroSteps} />
      <div data-block="bh0a3" className="mx-auto w-full max-w-5xl px-6 pb-10">
        <PageBody blocks={body(w)} set={SET} />
        {/* 577-10 (владелец 2026-10-23): вместо рабочего экрана «меню разделов + окно» — таблица каталога; Preview открывает блок на
            отдельной странице. Якорь #showcase остаётся: на него ведут кнопка первого экрана и тексты. */}
        <section data-block="bh0c1" id="showcase" aria-labelledby="showcase-t" className="my-10 scroll-mt-24">
          <SectionHead id="showcase-t" badge={w.showcase.badge} title={w.showcase.title} note={w.showcase.note} />
          <CatalogueTable rows={catalogueRows(lang)} ui={w.showcase} />
        </section>
        <PageBody blocks={agentBody(w, lang)} set={SET} />
        {features.faq && <Faq title={w.faqTitle} items={w.faq} />}
      </div>
    </div>
  )
}
