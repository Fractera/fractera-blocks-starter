import { Check, X } from 'lucide-react'
import { H2 } from '@/components/ui/typography'
import { inline } from '@/lib/blocks/inline'

// Сравнение «без него / с ним»: строки рядом, слева как было (крест, приглушённо), справа как стало (галочка, цвет темы). Все строки
// видны сразу — этим он и отличается от вида витрины `problemSolution`, где виден один случай за раз. Взят с лендинга элемента Stripe
// (шаг узла 577-3). Разметка — настоящая таблица: две колонки связаны построчно, и программа чтения с экрана читает их парами.
export type CompareTableProps = { blockKey?: string; title: string; head: [string, string]; rows: [string, string][] }

export function CompareTable({ blockKey: k = 'compare', title, head, rows }: CompareTableProps) {
  return (
    <section aria-labelledby={`${k}-t`} className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-16 md:py-24">
      <H2 id={`${k}-t`} className="max-w-[24ch] text-balance">{title}</H2>
      <div className="mt-10 overflow-hidden rounded-[calc(var(--radius)*1.5)] border border-border">
        <table className="w-full caption-bottom text-[length:var(--fs-small)]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th scope="col" className="w-1/2 px-5 py-3 text-left font-medium text-muted-foreground">{head[0]}</th>
              <th scope="col" className="w-1/2 px-5 py-3 text-left font-medium text-primary">{head[1]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${k}-${i}`} className="border-b border-border last:border-b-0">
                <td className="px-5 py-4 align-top text-muted-foreground">
                  <span className="flex gap-3"><X className="mt-1 size-4 shrink-0" aria-hidden /><span>{inline(r[0], `${k}-${i}-a`)}</span></span>
                </td>
                <td className="px-5 py-4 align-top font-medium text-foreground">
                  <span className="flex gap-3"><Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden /><span>{inline(r[1], `${k}-${i}-b`)}</span></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
