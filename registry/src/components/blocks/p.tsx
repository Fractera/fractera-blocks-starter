import { P as PText } from '@/components/ui/typography'
import { inline } from '@/lib/blocks/inline'

export type PProps = { blockKey?: string; text: string }

export function P({ blockKey: k = 'p', text }: PProps) {
  return <PText className="leading-8">{inline(text, k)}</PText>
}
