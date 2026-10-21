import { buildAlternates } from '@/lib/seo/alternates'
import { guideLangs, guideMetadata, GuidePage, LANGS } from '../_components/guide-page'
import { guideTree } from '../_libs/page-tree'

// 549-3: страница «Руководства» (`/<язык>/guide/<страница>`).
export const revalidate = 300
export function generateStaticParams() {
  const c = guideTree()
  return LANGS.flatMap((lang) => (c?.pages ?? []).filter((p) => p.langs.includes(lang)).map((p) => ({ lang, slug: p.slug.join('/') })))
}
export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const p = await params
  return { ...guideMetadata(p.lang, p.slug), alternates: buildAlternates(p.lang, `/guide/${p.slug}`, guideLangs(p.slug)) }
}
export default async function Page({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const p = await params
  return <GuidePage lang={p.lang} slug={p.slug} />
}
