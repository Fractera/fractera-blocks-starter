import type { ReactNode } from 'react'

// ФАБРИКА СТРАНИЦЫ ИЗ БЛОКОВ (элемент «Блоки», шаг 297). Страница — список `{ kind, ...поля }`; набор (`set`) называет
// ТОЛЬКО те блоки, что стоят в этом проекте. Контейнеры (`cards`, `card`) получают вложенные блоки в `children`.
// Блок, которого в наборе нет, — ошибка сборки с командой установки: пустое место на странице хуже громкого отказа.
export type BlockData = { kind: string; children?: BlockData[] | ReactNode; [field: string]: unknown }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlockSet = Record<string, (props: any) => ReactNode>

function render(b: BlockData, set: BlockSet, key: string): ReactNode {
  const Block = set[b.kind]
  if (!Block) throw new Error(`Block «${b.kind}» is not installed in this project: npx shadcn@latest add @fractera/${b.kind}`)
  const { kind: _kind, children, ...props } = b
  const kids = Array.isArray(children) ? (children as BlockData[]).map((c, i) => render(c, set, `${key}-${i}`)) : children
  return <Block key={key} blockKey={key} {...props}>{kids}</Block>
}

export function PageBody({ blocks, set }: { blocks: BlockData[]; set: BlockSet }) {
  return <>{blocks.map((b, i) => render(b, set, `b${i}`))}</>
}
