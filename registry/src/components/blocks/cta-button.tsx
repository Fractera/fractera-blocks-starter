import Link from 'next/link'
import type { ReactNode } from 'react'

// Кнопка главного действия — тот же вид, что `CtaButton` первого экрана сайта (`sections/cta-button.server.tsx`):
// пилюля цвета `--primary`, жирный текст, стрелка. Всё из токенов темы — ни одного своего цвета или размера числом.
// Блок реестра, а не импорт из `sections/`: проект получает его командой `shadcn add` вместе с первым экраном.
export function CtaButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
    >
      {children}
      <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
