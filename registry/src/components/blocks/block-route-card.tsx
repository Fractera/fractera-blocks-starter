import { Check, CornerDownLeft, CornerDownRight, CreditCard, Globe, KeyRound, Landmark, LayoutGrid, Mail, PlugZap, Store, UserRound } from 'lucide-react'
import { H2, H3, Small } from '@/components/ui/typography'
import { inline } from '@/lib/blocks/inline'

// Маршрут: станции подряд — значок, имя, что делает; под ними пометка (обратный путь или итог). Карточка с мягкой тенью цвета темы и
// одним движением появления (только при `prefers-reduced-motion: no-preference`). Взят с лендинга элемента Stripe (шаг узла 577-3).
// Значок — слово из закрытого списка `ICONS`, не имя файла: данные страницы не знают, из какой библиотеки значки.
const ICONS = { user: UserRound, key: KeyRound, app: LayoutGrid, store: Store, plug: PlugZap, card: CreditCard, bank: Landmark, check: Check, mail: Mail, globe: Globe }
export type RouteIcon = keyof typeof ICONS
type Station = { name: string; text: string; icon?: RouteIcon }
export type RouteCardProps = { blockKey?: string; title: string; stations: Station[]; note?: string; noteDirection?: 'back' | 'forward' }

export function RouteCard({ blockKey: k = 'route', title, stations, note, noteDirection = 'back' }: RouteCardProps) {
  const NoteIcon = noteDirection === 'back' ? CornerDownLeft : CornerDownRight
  return (
    <figure aria-labelledby={`${k}-t`} className="rounded-[calc(var(--radius)*2)] border border-border bg-card p-6 text-card-foreground shadow-[0_28px_64px_-32px_color-mix(in_oklab,var(--primary)_45%,transparent)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 md:p-8">
      <figcaption><H2 id={`${k}-t`} variant="ui">{title}</H2></figcaption>
      <ol className="mt-6 flex list-none flex-col p-0">
        {stations.map((s, i) => {
          const Icon = ICONS[s.icon ?? 'check'] ?? Check
          return (
            <li key={`${k}-${i}`} className="relative flex gap-4 pb-7 last:pb-0">
              {i < stations.length - 1 && <span aria-hidden className="absolute top-11 bottom-1 left-5 w-px -translate-x-1/2 bg-border" />}
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 pt-1">
                <H3 variant="ui">{s.name}</H3>
                <Small className="mt-1 text-pretty">{inline(s.text, `${k}-${i}-t`)}</Small>
              </div>
            </li>
          )
        })}
      </ol>
      {note && (
        <div className="mt-6 flex gap-3 rounded-[var(--radius)] border border-dashed border-primary/40 bg-primary/5 p-4">
          <NoteIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <Small className="text-pretty">{inline(note, `${k}-n`)}</Small>
        </div>
      )}
    </figure>
  )
}
