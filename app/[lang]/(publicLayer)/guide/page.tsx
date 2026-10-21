import { buildAlternates } from '@/lib/seo/alternates'
import { guideLangs, guideMetadata, GuideIndex, LANGS } from './_components/guide-page'

// 549-3: «Руководство» — список страниц коллекции (`/<язык>/guide`).
export const revalidate = 300
export const generateStaticParams = () => LANGS.map((lang) => ({ lang }))
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang
  // Markdown-двойник, который объявляет buildAlternates, — `./index.md`.
  return { ...guideMetadata(lang), alternates: buildAlternates(lang, '/guide', guideLangs()) }
}
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  return <GuideIndex lang={(await params).lang} />
}
