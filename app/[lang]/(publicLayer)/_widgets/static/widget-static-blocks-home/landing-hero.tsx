import { Database, LayoutGrid, Terminal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { H1, H2, H3, Lead, Small } from "@/components/ui/typography"
import { cn } from "@/lib/utils"

// 662-3 (владелец 2026-11-06: «Страница блоки … по сути нужно только стандартизировать первый раздел. Помни также что нужно сохранить
// идею»): первый экран — по образцу лендингов узла (Stripe, хранилище): слева заголовок, описание и кнопка, справа карточка «как блок
// попадает в проект» с тремя шагами, которые прежде шли полосой под центрированным заголовком. Слова те же (`body.i18n.ts`).
type Step = { title: string; text: string }
const ICONS = [LayoutGrid, Terminal, Database]

export function LandingHero({ pill, title, description, cta, howTitle, steps }: { pill: string; title: string; description: string; cta: { label: string; href: string }; howTitle: string; steps: Step[] }) {
  return (
    <section data-block="bh1a1" className="border-b border-border">
      <div data-block="bh1a2" className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-16 md:py-24">
        <div data-block="bh1a3" className="flex flex-col gap-6">
          <H1 data-block="bh1a4" scale="hero" className="text-balance">{title}</H1>
          <Lead data-block="bh1a5" className="max-w-[58ch] text-pretty">{description}</Lead>
          <div data-block="bh1a6" className="flex flex-wrap items-center gap-3 pt-2">
            <a href={cta.href} className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base")}>{cta.label}</a>
          </div>
          <Badge data-block="bh1a7" variant="outline" className="w-fit">{pill}</Badge>
        </div>
        <figure data-block="bh1a8" className="rounded-[calc(var(--radius)*2)] border border-border bg-card p-6 text-card-foreground shadow-[0_28px_64px_-32px_color-mix(in_oklab,var(--primary)_45%,transparent)] md:p-8">
          <figcaption data-block="bh1a9"><H2 data-block="bh1b1" variant="ui">{howTitle}</H2></figcaption>
          <ol data-block="bh1b2" className="mt-6 flex flex-col">
            {steps.map((s, i) => {
              const Icon = ICONS[i % ICONS.length]
              return (
                <li data-block="bh1b3" key={s.title} className="relative flex gap-4 pb-7 last:pb-0">
                  {i < steps.length - 1 && <span aria-hidden className="absolute top-11 bottom-1 left-5 w-px -translate-x-1/2 bg-border" />}
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div data-block="bh1b4" className="min-w-0 pt-1">
                    <H3 data-block="bh1b5" variant="ui">{s.title}</H3>
                    <Small data-block="bh1b6" className="mt-1 text-pretty">{s.text}</Small>
                  </div>
                </li>
              )
            })}
          </ol>
        </figure>
      </div>
    </section>
  )
}
