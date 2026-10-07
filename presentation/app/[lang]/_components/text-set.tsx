import { H3, P } from '@/components/ui/typography'
import { inline } from '@/lib/blocks/inline'

// ТИПОГРАФИКА ЭТОЙ СТРАНИЦЫ — третий вид элемента страницы рядом с блоками и виджетами (узел, шаг 423; владелец 2026-10-07).
// `block-p` и `block-h3` сняты из реестра: голый текст — не секция, его рисует типографика самого сайта.
type Text = { blockKey?: string; text: string; id?: string }

export const TEXT_SET = {
  'text-h3': ({ blockKey: k = 'h3', text, id }: Text) => <H3 id={id} className="mt-4 scroll-mt-24">{inline(text, k)}</H3>,
  'text-p': ({ blockKey: k = 'p', text }: Text) => <P className="leading-8">{inline(text, k)}</P>,
}
