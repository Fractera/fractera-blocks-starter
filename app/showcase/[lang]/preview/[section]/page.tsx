import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@reg/components/blocks/block-breadcrumbs'
import { H1, P } from '@reg/components/ui/typography'
import { catalogueRows, catalogueSections, UNSORTED } from '../../../_data/catalogue-rows'
import { blocksCatalogueUi } from '../../../_data/ui.i18n'
import { blocksHomeWords } from '@/app/[lang]/(publicLayer)/_widgets/static/widget-static-blocks-home/body.i18n'
import { CatalogueTable } from '@/app/[lang]/(publicLayer)/_widgets/static/widget-static-blocks-home/catalogue-table.client'

// РАЗДЕЛ КАТАЛОГА (577-11) — `/showcase/<язык>/preview/<раздел>`: крошки, название и назначение раздела и та же таблица, что на главной,
// только строки раздела; таблица помнит своё место отдельно (`scope` — раздел, 577-12). Владелец: «подобная структура появится и в …
// /showcase/ru/preview/?????/cards01». Все 14 разделов предрендерены, пустые тоже. noindex — как вся витрина.
const LANGS = ['en', 'ru']

export function generateStaticParams() {
  return LANGS.flatMap((lang) => [...catalogueSections(lang).map((s) => s.id), UNSORTED].map((section) => ({ lang, section })))
}

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function CatalogueSection({ params }: { params: Promise<{ lang: string; section: string }> }) {
  const { lang, section } = await params
  const s = catalogueSections(lang).find((x) => x.id === section)
  if (!LANGS.includes(lang) || (!s && section !== UNSORTED)) notFound()
  const ui = blocksCatalogueUi(lang)
  const rows = catalogueRows(lang).filter((r) => r.sectionId === section)
  const title = s?.title ?? section
  return (
    <main data-block="pv0s1" className="mx-auto w-full max-w-5xl px-6 py-8">
      <Breadcrumbs items={[{ label: ui.crumbBlocks, href: `/${lang}#showcase` }, { label: title }]} />
      <H1 data-block="pv0s2" className="mt-6">{title}</H1>
      {s?.purpose && <P data-block="pv0s3" className="mt-2 text-muted-foreground">{s.purpose}</P>}
      <CatalogueTable rows={rows} ui={blocksHomeWords(lang).showcase} scope={`section:${section}`} />
    </main>
  )
}
