import { H3 as H3Text } from '@/components/ui/typography'
import { inline } from '@/lib/blocks/inline'

export type H3Props = { blockKey?: string; text: string; id?: string }

export function H3({ blockKey: k = 'h3', text, id }: H3Props) {
  return <H3Text id={id} className="mt-4 scroll-mt-24">{inline(text, k)}</H3Text>
}
