import { H2 } from '@/components/ui/typography'
import { ALL_LANGUAGE_METADATA } from '@/config/translations/language-metadata'

// Лента языков, ползущая слева направо: все 82, флаг и название на самом языке. Выпуск вида витрины `languageMarquee`
// (`registry/src/sections/blocks/language-marquee.server.tsx`; шаг узла 577-3, владелец 2026-10-23: «элемент про 82 языка … существует»).
// 🔒 Все 82, а не включённый набор: лента про возможность продукта. 🔒 Движение — только CSS (`.marquee*` темы элемента, остановка при
// `prefers-reduced-motion`); с выключенным JavaScript лента стоит списком. Список выведен дважды: дорожка сдвигается на половину без шва.
export type LanguageMarqueeProps = { blockKey?: string; title: string; note?: string }

const LANGUAGES = Object.values(ALL_LANGUAGE_METADATA)

export function LanguageMarquee({ blockKey: k = 'languages', title, note }: LanguageMarqueeProps) {
  return (
    <section data-block="vwp6u" aria-labelledby={`${k}-t`} className="border-t border-border py-12">
      <div data-block="qnt0q" className="mb-8 px-6 text-center">
        <H2 data-block="k17co" id={`${k}-t`}>{title}</H2>
        {note && <p data-block="an01y" className="mt-2 text-sm text-muted-foreground">{note}</p>}
      </div>
      {/* Дорожка обрезается по краям экрана: наружу торчать ей нельзя, иначе у страницы появится горизонтальная прокрутка. */}
      <div data-block="mjcko" className="marquee group relative overflow-hidden">
        <ul data-block="hpkye" className="marquee-track flex w-max list-none gap-3 px-3">
          {[0, 1].map((copy) =>
            LANGUAGES.map((l) => (
              <li data-block="vc7xz"
                key={`${k}-${copy}-${l.code}`}
                aria-hidden={copy === 1 || undefined}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2.5"
              >
                <span aria-hidden className="text-lg leading-none">{l.flag}</span>
                <span className="whitespace-nowrap text-sm font-medium text-foreground">{l.nativeName}</span>
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  )
}
