import type { ReactNode } from 'react'

// РАЗМЕТКА ВНУТРИ СТРОКИ: **жирный** и [ссылка](адрес). Внешняя ссылка открывается в новой вкладке.
export function inline(text: string, kp: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    if (m[1] !== undefined) {
      nodes.push(<strong key={`${kp}-b${i}`} className="font-semibold text-foreground">{m[1]}</strong>)
    } else {
      const external = /^https?:\/\//.test(m[3])
      nodes.push(
        <a
          key={`${kp}-a${i}`}
          href={m[3]}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary"
        >
          {m[2]}
        </a>,
      )
    }
    last = re.lastIndex
    i++
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}
