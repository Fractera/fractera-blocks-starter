import type { SectionRenderer } from '@/sections/contract'
import { HeroCentered } from '@/components/blocks/hero-centered'

// Вид каталога `heroCentered` — тонкая обёртка над блоком реестра `components/blocks/hero-centered`: вёрстка одна,
// и витрина, и страницы, и проекты по `shadcn add` получают один и тот же код.
export const heroCentered: SectionRenderer<'heroCentered'> = (b, { key: k }) => (
  <HeroCentered key={k} blockKey={k} pill={b.pill} title={b.title} description={b.description} cta={b.cta} steps={b.steps} />
)
