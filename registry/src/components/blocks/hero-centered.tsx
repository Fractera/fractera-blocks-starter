import { H1, Lead } from '@/components/ui/typography'
import { CtaButton } from '@/components/blocks/cta-button'
import { inline } from '@/lib/blocks/inline'

// Первый экран в одну колонку (303-2, владелец 2026-09-25): бейдж → заголовок → полоса-градиент → описание → кнопка.
// Картинки и логотипа нет намеренно — это вид для страниц, где главное сказано словами.
// Заголовок светится (`.h1-glow`), бейдж — `.pill-ai` (вращающаяся каёмка); оба класса и размеры шрифта живут в
// дизайн-системе (globals.css) проекта.
// 🔒 H1 ЗДЕСЬ: страница, взявшая этот блок, свой заголовок не печатает — H1 на странице один.
export type HeroCenteredProps = {
  blockKey?: string
  pill?: string
  title: string
  description: string
  cta?: { label: string; href: string }
}

// 🔒 ПОЛОСА СТОИТ НА МЕСТЕ, ЗАГОЛОВОК РАСТЁТ ВВЕРХ (владелец 2026-09-25). Над полосой — область постоянной высоты:
// 8rem (80px сверху + место бейджа 28px + зазор 20px) плюс одна строка обычного H1 этого экрана. Заголовок прижат к
// её низу, поэтому длинный текст поднимается вверх, а полоса не двигается. Строк не больше 5 · 4 · 3 (телефон ·
// планшет · компьютер), дальше многоточие; все они помещаются в область: 150 ≤ 165, 150 ≤ 173, 135 ≤ 188 px.
const BOX = 'min-h-[calc(8rem+var(--fs-h1)*1.25)] md:min-h-[calc(8rem+var(--fs-h1-md)*1.25)] lg:min-h-[calc(8rem+var(--fs-h1-lg)*1.25)]'
// Размер — переменные темы `--fs-hero-one*` (24 · 30 · 36px при множителе 1); запасное число — на случай проекта,
// где их ещё нет. Поля ±0.5rem — чтобы обрезка по строкам не срезала свечение букв.
const TITLE = 'h1-glow -mx-2 -my-2 px-2 py-2 line-clamp-5 md:line-clamp-4 lg:line-clamp-3 text-[length:var(--fs-hero-one,1.5rem)] md:text-[length:var(--fs-hero-one-md,1.875rem)] lg:text-[length:var(--fs-hero-one-lg,2.25rem)] leading-tight'

export function HeroCentered({ blockKey: k = 'hero', pill, title, description, cta }: HeroCenteredProps) {
  return (
    <section aria-labelledby={`${k}-t`} className="mt-6 mb-10 flex flex-col gap-5">
      {/* Полоса относится к контейнеру заголовка, а не к слову: слева полный акцент, вправо уход в прозрачность —
          тот же приём, что у двухколоночного первого экрана. Декоративна, скрыта от чтения с экрана. */}
      <div className="flex w-full flex-col">
        <div className={`flex flex-col justify-end gap-5 ${BOX}`}>
          {pill && (
            <span className="pill-ai inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-foreground">
              {pill}
            </span>
          )}
          <H1 id={`${k}-t`} className={TITLE}>{title}</H1>
        </div>
        <span aria-hidden className="mt-4 block h-1 w-full rounded-full bg-gradient-to-r from-primary via-primary/40 to-transparent" />
      </div>
      <Lead className="max-w-3xl">{inline(description, `${k}-d`)}</Lead>
      {cta && (
        <div className="mt-1">
          <CtaButton href={cta.href}>{cta.label}</CtaButton>
        </div>
      )}
    </section>
  )
}
