import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@reg/components/blocks/block-breadcrumbs'
import { PostBody } from '@reg/components/content-page/post-body'
import { drawCase } from '../../../../_data/published-cases'
import { catalogueRows, catalogueSections, previewParams, previewTarget } from '../../../../_data/catalogue-rows'
import { blocksCatalogueUi } from '../../../../_data/ui.i18n'

// PREVIEW ОДНОГО БЛОКА (шаги узла 577-10, 577-11) — `/showcase/<язык>/preview/<раздел>/<блок или код образца>`. Владелец 2026-10-23:
// «открывать этот элемент в отдельной страницы на которой будет расположена один единственный элемент больше ничего за исключение хлебных
// крошек чтобы пользователь вернуться назад»; «я ожидал что подобная структура появится и в: …/showcase/ru/preview/?????/cards01» — раздел
// стоит уровнем адреса, как у страниц блоков элемента. На странице — крошки «Блоки / раздел / блок» и один блок: опубликованный — данными
// своего первого кейса, образец — своими данными. Предрендер — по тому же списку, что строки таблицы. noindex — как вся витрина.
const LANGS = ['en', 'ru']

export function generateStaticParams() {
  return LANGS.flatMap((lang) => previewParams().map((p) => ({ lang, ...p })))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }): Promise<Metadata> {
  const { id } = await params
  return { title: `${id} — Blocks`, robots: { index: false, follow: false } }
}

export default async function BlockPreview({ params }: { params: Promise<{ lang: string; section: string; id: string }> }) {
  const { lang, section, id } = await params
  const row = LANGS.includes(lang) ? catalogueRows(lang).find((r) => r.id === id && r.sectionId === section) : undefined
  const target = row ? previewTarget(id) : null
  if (!row || !target) notFound()
  const ui = blocksCatalogueUi(lang)
  const sectionName = catalogueSections(lang).find((s) => s.id === section)?.title ?? row.section
  return (
    <main data-block="pv0m1" className="mx-auto w-full max-w-5xl px-6 py-8">
      <Breadcrumbs
        items={[
          { label: ui.crumbBlocks, href: `/${lang}#showcase` },
          { label: sectionName, href: `/showcase/${lang}/preview/${section}` },
          { label: target.name },
        ]}
      />
      <div data-block="pv0m2" className="mt-8">
        {target.kind === 'block' ? drawCase(target.name, target.props) : <PostBody blocks={target.sample.blocks} lang={lang} />}
      </div>
    </main>
  )
}
