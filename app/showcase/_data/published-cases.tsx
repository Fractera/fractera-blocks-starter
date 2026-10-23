import { createElement, type ReactNode } from 'react'
import { H2, H3, H4, P, Small } from '@reg/components/ui/typography'
import { PUBLISHED_BLOCKS } from './published-blocks.generated'
import { blocksCatalogueUi, type BlocksCatalogueUi } from './ui.i18n'

// THE PUBLISHED BLOCKS OF A SECTION ON THE SHOWCASE (node step 577-2). For every block whose card names the section: when to take it,
// when not to, its place (the owner's three formulas), the install command, and every case drawn by the REAL component with the case's
// sample data. The cards come from the generated module (`scripts/block-cards.mjs --write`): what the showcase shows is what an
// element installs. Children of a container case (`block-cards` → `block-card` → text) are drawn the way a page draws them.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Card = any
type Node = { kind?: string; text?: string; children?: Node[] | string; [k: string]: unknown }

const BY: Record<string, (props: Record<string, unknown>) => ReactNode> = Object.fromEntries(PUBLISHED_BLOCKS.map((b) => [b.name, b.component]))
const TEXT: Record<string, (props: { children: ReactNode }) => ReactNode> = { 'text-h3': H3, 'text-h4': H4, 'text-p': P, 'text-small': Small }

function node(n: Node, key: number): ReactNode {
  const { kind, children, text, ...props } = n
  if (kind && TEXT[kind]) return createElement(TEXT[kind], { key, children: text })
  const C = kind ? BY[kind] : undefined
  if (!C) return null
  const kids = Array.isArray(children) ? children.map((c, i) => node(c, i)) : children
  return createElement(C, { key, ...props, ...(kids !== undefined ? { children: kids } : {}) })
}

/** 577-10: the Preview page draws one block with its first case the same way. */
export function drawCase(name: string, props: Record<string, unknown>): ReactNode {
  const { children, ...rest } = props as { children?: Node[] | string }
  const kids = Array.isArray(children) ? children.map((c, i) => node(c, i)) : children
  return createElement(BY[name], { ...rest, ...(kids !== undefined ? { children: kids } : {}) })
}

function place(card: Card, ui: BlocksCatalogueUi): string {
  const list = (card.placement?.inside ?? []).join(', ')
  if (card.placement?.page && !list) return ui.standalone
  if (card.placement?.page) return ui.standaloneInside.replace('{list}', list)
  return ui.onlyInside.replace('{list}', list)
}

export function PublishedCases({ lang, section }: { lang: string; section: string }) {
  const ui = blocksCatalogueUi(lang)
  const list = PUBLISHED_BLOCKS.filter((b) => (b.card.categories ?? []).includes(section) && b.card.status === 'published')
  if (!list.length) return null
  return (
    <section data-block="pubcs" aria-labelledby="published-t" className="mb-12 flex flex-col gap-10">
      <H2 id="published-t">{ui.publishedTitle}</H2>
      {list.map(({ name, card }) => (
        <article data-block="pubcb" key={name} id={name} className="flex flex-col gap-3 border-t border-border pt-6">
          <H3>{name}</H3>
          <P><strong>{ui.whenLabel}:</strong> {card.use}</P>
          <P><strong>{ui.avoidLabel}:</strong> {card.avoid}</P>
          <Small><strong>{ui.placeLabel}:</strong> {place(card, ui)} · <strong>{ui.installLabel}:</strong> <code>npx shadcn add @fractera/{name}</code></Small>
          {card.cases.map((c: Card, i: number) => (
            <div data-block="pubcc" key={i} className="mt-4 flex flex-col gap-3 rounded-2xl border border-dashed border-border p-4">
              <Small><strong>{ui.caseLabel} {i + 1}:</strong> {c.title} · <strong>{ui.whyLabel}:</strong> {c.why}</Small>
              <div data-block="pubcr" className="rounded-xl bg-background p-2">{drawCase(name, c.props)}</div>
            </div>
          ))}
        </article>
      ))}
    </section>
  )
}
