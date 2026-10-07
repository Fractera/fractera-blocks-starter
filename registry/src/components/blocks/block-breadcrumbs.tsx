// ХЛЕБНЫЕ КРОШКИ + разметка BreadcrumbList — в одном месте: объявленное поисковику и показанное человеку совпадают
// по построению. Адреса — абсолютные (другой домен, например главная сайта, — обычная ссылка).
export type Crumb = { label: string; href?: string }
export type BreadcrumbsProps = { items: Crumb[] }

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.filter((c) => c.href).map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: c.href })),
  }
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ol className="flex min-w-0 flex-nowrap items-center gap-1.5 overflow-hidden">
        {items.map((c, i) => {
          const last = i === items.length - 1
          return (
            <li key={i} className={`flex items-center gap-1.5 ${last ? 'min-w-0' : 'shrink-0'}`}>
              {c.href && !last ? (
                <a href={c.href} className="whitespace-nowrap hover:text-foreground">{c.label}</a>
              ) : (
                <span aria-current="page" className="block min-w-0 truncate text-foreground">{c.label}</span>
              )}
              {!last && <span aria-hidden className="shrink-0 text-muted-foreground">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
