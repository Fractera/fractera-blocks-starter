import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@reg/components/blocks/block-breadcrumbs'
import { PostBody } from '@reg/components/content-page/post-body'
import { drawCase } from '../../../_data/published-cases'
import { previewIds, previewTarget } from '../../../_data/catalogue-rows'
import { blocksCatalogueUi } from '../../../_data/ui.i18n'

// PREVIEW ОДНОГО БЛОКА (шаг узла 577-10) — `/showcase/<язык>/preview/<блок или код образца>`. Владелец 2026-10-23: «открывать этот
// элемент в отдельной страницы на которой будет расположена один единственный элемент больше ничего за исключение хлебных крошек чтобы
// пользователь вернуться назад». На странице — крошки и один блок: опубликованный рисуется данными своего первого кейса, образец —
// своими образцовыми данными. Страницы предрендерены по тому же списку, что строки таблицы: новый блок получает свою с той же сборкой.
// noindex — как вся витрина: образцы несут настоящие h2/h3.
const LANGS = ['en', 'ru']

export function generateStaticParams() {
  return LANGS.flatMap((lang) => previewIds().map((id) => ({ lang, id })))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }): Promise<Metadata> {
  const { id } = await params
  return { title: `${id} — Blocks`, robots: { index: false, follow: false } }
}

export default async function BlockPreview({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params
  const target = LANGS.includes(lang) ? previewTarget(id) : null
  if (!target) notFound()
  const ui = blocksCatalogueUi(lang)
  return (
    <main data-block="pv0m1" className="mx-auto w-full max-w-5xl px-6 py-8">
      <Breadcrumbs items={[{ label: ui.crumbBlocks, href: `/${lang}#showcase` }, { label: target.name }]} />
      <div data-block="pv0m2" className="mt-8">
        {target.kind === 'block' ? drawCase(target.name, target.props) : <PostBody blocks={target.sample.blocks} lang={lang} />}
      </div>
    </main>
  )
}
