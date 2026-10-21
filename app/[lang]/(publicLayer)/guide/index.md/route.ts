// @api the guide of the blocks element as markdown for agents
import { guideMarkdown, LANGS } from '../_components/guide-page'

export const generateStaticParams = () => LANGS.map((lang) => ({ lang }))
export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!LANGS.includes(lang)) return new Response('Not found', { status: 404 })
  return new Response(guideMarkdown(lang), { headers: { 'content-type': 'text/markdown; charset=utf-8' } })
}
