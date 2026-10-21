// @api one guide page of the blocks element as markdown for agents
import { guideMarkdown, LANGS } from '../../_components/guide-page'

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const md = LANGS.includes(lang) ? guideMarkdown(lang, slug) : ''
  return md ? new Response(md, { headers: { 'content-type': 'text/markdown; charset=utf-8' } }) : new Response('Not found', { status: 404 })
}
