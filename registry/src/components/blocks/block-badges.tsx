import { badgeClass, type Tone } from '@/lib/blocks/tone'

// Ряд ярлыков: короткие признаки, цвет — смысловая группа.
export type BadgesProps = { blockKey?: string; items: { label: string; tone: Tone }[] }

export function Badges({ blockKey: k = 'badges', items }: BadgesProps) {
  return (
    <div className="mt-8 flex flex-wrap justify-center gap-2">
      {items.map((item, i) => <span key={`${k}-${i}`} className={badgeClass(item.tone)}>{item.label}</span>)}
    </div>
  )
}
