import { inline } from '@/lib/blocks/inline'
import { SectionHead } from '@/components/blocks/section-head'

// РАБОЧИЙ ЭКРАН ВИТРИНЫ: меню разделов слева, окно предпросмотра справа (297; слово владельца 2026-09-25: «workspace …
// меню слева и перечисление дизайн-блоков справа»). Ни строки клиентского JS: ссылка меню открывает раздел в окне через
// \`target\` = \`name\` окна — работает с выключенным скриптом, страница остаётся статической. Образцы живут на своих
// страницах (noindex) — их h2/h3 не ломают иерархию заголовков страницы, на которой стоит этот экран.
export type ShowcaseFrameProps = {
  id: string
  badge?: string
  title: string
  note?: string
  menuTitle: string
  frameTitle: string
  items: { id: string; label: string; href: string }[]
}

export function ShowcaseFrame({ id, badge, title, note, menuTitle, frameTitle, items }: ShowcaseFrameProps) {
  const frame = `${id}-frame`
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="my-10 scroll-mt-24">
      <SectionHead id={`${id}-t`} badge={badge} title={title} note={note ? inline(note, `${id}-n`) : undefined} />
      <div className="mt-8 grid overflow-hidden rounded-2xl border border-border md:grid-cols-[220px_1fr]">
        <nav aria-label={menuTitle} className="border-b border-border bg-muted/30 p-3 md:border-b-0 md:border-r">
          <p className="px-2 pb-2 text-[length:var(--fs-eyebrow)] font-medium uppercase tracking-widest text-muted-foreground">{menuTitle}</p>
          <ul className="flex list-none flex-row flex-wrap gap-1 p-0 md:flex-col">
            {items.map((it) => (
              <li key={it.id}>
                <a href={it.href} target={frame} className="block rounded-md px-2 py-1.5 text-[length:var(--fs-small)] text-foreground transition-colors hover:bg-muted">
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <iframe name={frame} title={frameTitle} src={items[0]?.href} loading="lazy" className="h-[80vh] w-full bg-background" />
      </div>
    </section>
  )
}
