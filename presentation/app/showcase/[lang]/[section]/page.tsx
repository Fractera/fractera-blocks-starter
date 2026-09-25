import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { Block } from '@/lib/content/blocks/types'
import { PostBody } from '@/components/content-page/post-body'
import SECTIONS from '@/sections/SECTIONS.json'
import { SPECIMEN, SPECIMEN_CODES } from '../../_data/specimen'
import { blocksCatalogueUi } from '../../_data/ui.i18n'

// ВИТРИНА ОДНОГО РАЗДЕЛА БЛОКОВ (297) — `/showcase/<язык>/<раздел>`. Показывается в окне предпросмотра рабочего экрана
// на главной элемента; своей шапки нет, в поиск не идёт (noindex): образцы несут настоящие h2/h3, и на главной они
// сломали бы иерархию заголовков. Движок и образцы — те же, что были в каталоге ядра (перенесены как есть).
type SectionType = { id: string; title: Record<string, string> }
const TYPES = SECTIONS.types as SectionType[]
const TYPE_OF = new Map((SECTIONS.kinds as { kind: string; type: string }[]).map((k) => [k.kind, k.type]))
const LANGS = ['en', 'ru']

export function generateStaticParams() {
  return LANGS.flatMap((lang) => TYPES.map((t) => ({ lang, section: t.id })))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; section: string }> }): Promise<Metadata> {
  const { lang, section } = await params
  const t = TYPES.find((x) => x.id === section)
  return { title: t ? (t.title[lang] ?? t.title.en) : 'Blocks', robots: { index: false, follow: false } }
}

export default async function ShowcaseSection({ params }: { params: Promise<{ lang: string; section: string }> }) {
  const { lang, section } = await params
  if (!LANGS.includes(lang) || !TYPES.some((t) => t.id === section)) notFound()
  const ui = blocksCatalogueUi(lang)
  const shown = SPECIMEN.map((s, i) => ({ s, code: SPECIMEN_CODES[i] })).filter(({ s }) => TYPE_OF.get(s.kind) === section)
  const blocks: Block[] = shown.flatMap(({ s, code }): Block[] => [
    { kind: 'separator' },
    { kind: 'badges', items: [{ label: code, tone: 'code' }, ...(s.label ? [{ label: s.label, tone: 'muted' as const }] : [])] },
    { kind: 'p', text: `**${ui.whenLabel}:** ${lang === 'ru' && s.whenRu ? s.whenRu : s.when}` },
    ...s.blocks,
  ])
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <PostBody blocks={blocks} lang={lang} />
    </main>
  )
}
