import type { ReactNode } from 'react'
import { H1, Lead } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { inline } from '@/lib/blocks/inline'
import { cn } from '@/lib/utils'

// Первый экран в две колонки: слева заголовок, фраза, одно-два действия и ярлык под ними; справа — фигура, потомок блока
// (`block-route-card`). Взят с лендинга элемента Stripe (шаг узла 577-3; владелец 2026-10-23: «две хорошие секции одна секция герой
// другая секция сравнения … добавь её в существующий каталог блоков»). На телефоне фигура уходит под текст.
export type HeroFigureProps = {
  blockKey?: string
  pill?: string
  title: string
  description: string
  cta?: { label: string; href: string }
  secondary?: { label: string; href: string }
  children?: ReactNode
}

export function HeroFigure({ blockKey: k = 'hero-figure', pill, title, description, cta, secondary, children }: HeroFigureProps) {
  return (
    <section aria-labelledby={`${k}-t`} className="border-b border-border">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-16 md:py-24">
        <div className="flex flex-col gap-6">
          <H1 id={`${k}-t`} scale="hero" className="text-balance">{title}</H1>
          <Lead className="max-w-[58ch] text-pretty">{inline(description, `${k}-d`)}</Lead>
          {(cta || secondary) && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {cta && <a href={cta.href} className={cn(buttonVariants({ size: 'lg' }), 'h-11 px-5 text-base')}>{cta.label}</a>}
              {secondary && <a href={secondary.href} className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'h-11 px-5 text-base')}>{secondary.label}</a>}
            </div>
          )}
          {pill && <Badge variant="outline" className="w-fit">{pill}</Badge>}
        </div>
        {children && <div className="min-w-0">{children}</div>}
      </div>
    </section>
  )
}
