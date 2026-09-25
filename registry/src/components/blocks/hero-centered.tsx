import Link from 'next/link'
import { H1, Lead } from '@/components/ui/typography'
import { buttonVariants } from '@/components/ui/button'
import { inline } from '@/lib/blocks/inline'

// Первый экран в одну колонку (303-2, владелец 2026-09-25): бейдж → заголовок → полоса-градиент → описание → кнопка.
// Картинки и логотипа нет намеренно — это вид для страниц, где главное сказано словами.
// Размер заголовка — обычный H1 страницы (ступень `page`), а не `hero`: заказ «как на главной Блоков», но со свечением
// `.h1-glow`. Бейдж — `.pill-ai` (вращающаяся каёмка). Оба класса живут в дизайн-системе (globals.css) проекта:
// без них блок рисуется, но без свечения и без анимации.
// 🔒 H1 ЗДЕСЬ: страница, взявшая этот блок, свой заголовок не печатает — H1 на странице один.
export type HeroCenteredProps = {
  blockKey?: string
  pill?: string
  title: string
  description: string
  cta?: { label: string; href: string }
}

export function HeroCentered({ blockKey: k = 'hero', pill, title, description, cta }: HeroCenteredProps) {
  return (
    <section aria-labelledby={`${k}-t`} className="mt-6 mb-10 flex flex-col gap-5">
      {pill && (
        <span className="pill-ai inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-foreground">
          {pill}
        </span>
      )}
      {/* Полоса относится к контейнеру заголовка, а не к слову: слева полный акцент, вправо уход в прозрачность —
          тот же приём, что у двухколоночного первого экрана. Декоративна, скрыта от чтения с экрана. */}
      <div className="flex w-full flex-col">
        <H1 id={`${k}-t`} className="h1-glow">{title}</H1>
        <span aria-hidden className="mt-4 block h-1 w-full rounded-full bg-gradient-to-r from-primary via-primary/40 to-transparent" />
      </div>
      <Lead className="max-w-3xl">{inline(description, `${k}-d`)}</Lead>
      {cta && (
        <div className="mt-1">
          <Link href={cta.href} className={buttonVariants({ size: 'lg', className: 'h-11 px-6 text-base' })}>
            {cta.label}
          </Link>
        </div>
      )}
    </section>
  )
}
