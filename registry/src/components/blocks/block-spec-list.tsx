import { H2, Small } from '@/components/ui/typography'
import { inline } from '@/lib/blocks/inline'

// Части: имя слева, что делает справа, строками через черту. Список определений, а не таблица: у пары «имя — что делает» нет колонок,
// которые надо сравнивать. Взят с лендинга элемента Stripe (раздел «под капотом», шаг узла 577-3).
export type SpecListProps = { blockKey?: string; title: string; head?: [string, string]; rows: [string, string][] }

export function SpecList({ blockKey: k = 'spec', title, head, rows }: SpecListProps) {
  const COLS = 'md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]'
  return (
    <section data-block="xs88m" aria-labelledby={`${k}-t`} className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-16 md:py-24">
      <H2 data-block="fn4vc" id={`${k}-t`} className="text-balance">{title}</H2>
      <div data-block="nwjwv" className="mt-10 border-y border-border">
        {head && (
          <div data-block="hqvnl" className={`hidden gap-8 border-b border-border py-3 md:grid ${COLS}`}>
            <Small data-block="vhnui" className="font-medium">{head[0]}</Small>
            <Small data-block="sps5v" className="font-medium">{head[1]}</Small>
          </div>
        )}
        <dl data-block="xd0cj" className="divide-y divide-border">
          {rows.map((r, i) => (
            <div data-block="d9mhb" key={`${k}-${i}`} className={`grid gap-1 py-4 md:gap-8 ${COLS}`}>
              <dt data-block="p7m74" className="font-medium text-foreground">{inline(r[0], `${k}-${i}-a`)}</dt>
              <dd data-block="g7a9m" className="text-pretty text-muted-foreground">{inline(r[1], `${k}-${i}-b`)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
