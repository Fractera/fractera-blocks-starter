import { blocksHomeWords } from './body.i18n'
import { withTerminal } from './terminal'
import { catalogueRows, catalogueCounts } from '@/app/showcase/_data/catalogue-rows'

// 549-3: markdown-копия главной «Блоков» для агентов — дословно прежний `presentation/app/[lang]/index.md/route.ts` blocks v0.5.24.
export function markdown(lang: string): string {
  const w = blocksHomeWords(lang)
  // 577-10: the numbers and the catalogue table — counted from the same rows as the page.
  const counts = catalogueCounts()
  const rows = catalogueRows(lang)
  const list = (items: { title: string; text: string }[]) => items.map((i) => `- **${i.title}.** ${i.text}`).join('\n')
  return [
    `# ${w.title}`, '', w.description, '',
    w.metrics.map((m) => `- ${m.value.replace('{rows}', String(counts.rows)).replace('{sections}', String(counts.sections))} — ${m.label}`).join('\n'), '',
    `## ${w.why.title}`, '', w.why.note, '', list(w.why.items), '',
    `## ${w.who.title}`, '', w.who.note, '', list(w.who.items), '',
    `## ${w.custom.title}`, '', w.custom.note, '', list([w.custom.block, w.custom.widget]), '',
    `## ${w.choose.title}`, '', w.choose.note, '', w.choose.steps.map((s, i) => `${i + 1}. **${s.title}.** ${s.text}`).join('\n'), '',
    `## ${w.showcase.title}`, '', w.showcase.note, '',
    rows.map((r) => `- \`${r.name}\` (${r.kind === 'block' ? w.showcase.kinds.block : w.showcase.kinds.sample}, ${r.section}) — ${r.description}`).join('\n'), '',
    `## ${w.agent.title}`, '', withTerminal(w.agent.note, lang), '',
    w.agent.steps.map((s, i) => `${i + 1}. **${s.title}.** ${withTerminal(s.text, lang)}`).join('\n'), '',
    `### ${w.agent.scenarios.title}`, '', w.agent.scenarios.note, '', list(w.agent.scenarios.items), '',
    `## ${w.faqTitle}`, '', w.faq.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n'), '',
  ].join('\n')
}
