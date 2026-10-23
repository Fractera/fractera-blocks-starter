import SECTIONS from '@reg/sections/SECTIONS.json'
import { PUBLISHED_BLOCKS } from './published-blocks.generated'
import { SPECIMEN, SPECIMEN_CODES, type SpecimenSection } from './specimen'
import { blocksCatalogueUi } from './ui.i18n'

// СТРОКИ ТАБЛИЦЫ КАТАЛОГА (шаг узла 577-10). Владелец 2026-10-23: «обычную таблицу с пагинацией … максимум одну строку … вторая колонка
// будет называться Preview и она должна будет открывать этот элемент в отдельной страницы»; «по мере добавления новых блоков вся эта
// конструкция должна автоматически обновляться».
// 🔒 ОДИН ИСТОЧНИК: опубликованные блоки — сгенерированный модуль карточек (`scripts/block-cards.mjs --write`, сторож `--check` в
// `prebuild`), образцы — `specimen.ts` (сторож `check:blocks`). Таблица на главной, число на главной и страницы Preview читают ЭТОТ
// модуль: новый блок появляется везде с той же сборкой, второго списка нет.

type SectionType = { id: string; order: number; title: Record<string, string> }
const TYPES = SECTIONS.types as SectionType[]
const TYPE_BY_ID = new Map(TYPES.map((t) => [t.id, t]))
const TYPE_OF_KIND = new Map((SECTIONS.kinds as { kind: string; type: string }[]).map((k) => [k.kind, k.type]))

export const UNSORTED = 'unsorted'

export type CatalogueRow = {
  /** Адрес страницы Preview: имя опубликованного блока или код образца. */
  id: string
  name: string
  kind: 'block' | 'sample'
  /** 577-11: раздел — уровень адреса Preview (`/showcase/<язык>/preview/<раздел>/<id>`). */
  sectionId: string
  section: string
  description: string
  place: string
  version: string
  href: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function placeOf(card: any, lang: string): string {
  const ui = blocksCatalogueUi(lang)
  const list = (card.placement?.inside ?? []).join(', ')
  if (card.placement?.page && !list) return ui.standalone
  if (card.placement?.page) return ui.standaloneInside.replace('{list}', list)
  return ui.onlyInside.replace('{list}', list)
}

const sectionTitle = (id: string | undefined, lang: string) => {
  const t = id ? TYPE_BY_ID.get(id) : undefined
  return t ? (t.title[lang] ?? t.title.en) : '—'
}
const sectionOrder = (id: string | undefined) => (id ? TYPE_BY_ID.get(id)?.order ?? 999 : 999)

/** Опубликованные блоки (ставятся командой) и образцы движка; по разделам, внутри раздела — сначала блоки. */
export function catalogueRows(lang: string): CatalogueRow[] {
  const blocks = PUBLISHED_BLOCKS.filter((b) => b.card.status === 'published').map((b) => {
    const sec = (b.card.categories ?? [])[0] as string | undefined
    return {
      order: [sectionOrder(sec), 0] as const,
      row: {
        id: b.name, name: b.name, kind: 'block' as const, sectionId: sec ?? UNSORTED, section: sectionTitle(sec, lang), description: String(b.card.use ?? ''),
        place: placeOf(b.card, lang), version: String(b.card.version ?? '—'), href: `/showcase/${lang}/preview/${sec ?? UNSORTED}/${b.name}`,
      },
    }
  })
  const samples = SPECIMEN.map((s, i) => {
    const code = SPECIMEN_CODES[i]
    const sec = TYPE_OF_KIND.get(s.kind)
    return {
      order: [sectionOrder(sec), 1] as const,
      row: {
        id: code, name: s.label ? `${code} · ${s.label}` : code, kind: 'sample' as const, sectionId: sec ?? UNSORTED, section: sectionTitle(sec, lang),
        description: lang === 'ru' && s.whenRu ? s.whenRu : s.when, place: '—', version: '—', href: `/showcase/${lang}/preview/${sec ?? UNSORTED}/${code}`,
      },
    }
  })
  return [...blocks, ...samples]
    .sort((a, b) => a.order[0] - b.order[0] || a.order[1] - b.order[1])
    .map((x) => x.row)
}

/** Что рисует страница Preview: блок с данными первого кейса или образец движка. */
export type PreviewTarget =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { kind: 'block'; name: string; props: Record<string, any> }
  | { kind: 'sample'; name: string; sample: SpecimenSection }

export function previewTarget(id: string): PreviewTarget | null {
  const b = PUBLISHED_BLOCKS.find((x) => x.name === id && x.card.status === 'published')
  if (b) return { kind: 'block', name: b.name, props: b.card.cases?.[0]?.props ?? {} }
  const i = SPECIMEN_CODES.indexOf(id)
  return i >= 0 ? { kind: 'sample', name: id, sample: SPECIMEN[i] } : null
}

/** Пары «раздел · id» для предрендера страниц Preview — тем же счётом, что строки таблицы. */
export const previewParams = (): { section: string; id: string }[] => catalogueRows('en').map((r) => ({ section: r.sectionId, id: r.id }))

/** Разделы с их названием и назначением — для страницы раздела. */
export function catalogueSections(lang: string): { id: string; title: string; purpose: string }[] {
  return TYPES.slice().sort((a, b) => a.order - b.order).map((t) => ({ id: t.id, title: t.title[lang] ?? t.title.en, purpose: ((t as unknown as { purpose?: Record<string, string> }).purpose?.[lang] ?? (t as unknown as { purpose?: Record<string, string> }).purpose?.en ?? '') }))
}

/** Сколько записей в каталоге и сколько разделов — числа главной, тем же счётом, что таблица. */
export function catalogueCounts(): { rows: number; sections: number } {
  return { rows: catalogueRows('en').length, sections: TYPES.length }
}
