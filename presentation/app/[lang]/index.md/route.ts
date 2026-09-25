// МАШИННЫЙ ДВОЙНИК ГЛАВНОЙ ДЛЯ АГЕНТОВ: тот же текст, что на странице, в markdown (`/<язык>/index.md`). Строится из
// тех же слов (`../_data/body.ts`) — расходиться со страницей ему не из чего. Статический: запрос не читает.
import { blocksHomeWords, LANGS } from '../_data/body'

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!LANGS.includes(lang)) return new Response('Not found', { status: 404 })
  const w = blocksHomeWords(lang)
  const list = (items: { title: string; text: string }[]) => items.map((i) => `- **${i.title}.** ${i.text}`).join('\n')
  const md = [
    `# ${w.title}`, '', w.description, '',
    w.metrics.map((m) => `- ${m.value} — ${m.label}`).join('\n'), '',
    `## ${w.why.title}`, '', w.why.note, '', list(w.why.items), '',
    `## ${w.who.title}`, '', w.who.note, '', list(w.who.items), '',
    `## ${w.custom.title}`, '', w.custom.note, '', list([w.custom.block, w.custom.widget]), '',
    `## ${w.choose.title}`, '', w.choose.note, '', w.choose.steps.map((s, i) => `${i + 1}. **${s.title}.** ${s.text}`).join('\n'), '',
    `## ${w.faqTitle}`, '', w.faq.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n'), '',
  ].join('\n')
  return new Response(md, { headers: { 'content-type': 'text/markdown; charset=utf-8' } })
}
