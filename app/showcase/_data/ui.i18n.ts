// Слова страницы «Каталог секций» (слой прав `admin`).
//
// 🔒 ЯЗЫКОВ СТОЛЬКО, СКОЛЬКО ВКЛЮЧЕНО (`NEXT_PUBLIC_SUPPORTED_LANGUAGES`, сейчас
// десять) — это строки ОДНОЙ страницы. Сторож `npm run check:i18n` держит число.
// Тексты самих образцов живут в `specimen.ts` и остаются английскими намеренно:
// они показывают форму секции, а не обращаются к посетителю.

export type BlocksCatalogueUi = {
  title: string
  subtitle: string
  countLabel: string
  whenLabel: string
  /** 577-2: the published blocks of a section — their cards and cases (`published-cases.tsx`). */
  publishedTitle: string
  avoidLabel: string
  placeLabel: string
  /** Placement formulas of the owner (2026-10-23); {list} — the containers. */
  standalone: string
  standaloneInside: string
  onlyInside: string
  caseLabel: string
  whyLabel: string
  installLabel: string
  /** 577-10: the first crumb of a Preview page — back to the table on the home page. */
  crumbBlocks: string
}

const UI: Record<string, BlocksCatalogueUi> = {
  en: { title: 'Section catalogue', subtitle: 'Every kind of section the content engine can render, drawn by the real renderer with sample data.', countLabel: 'kinds', whenLabel: 'When to use it', publishedTitle: 'Blocks of this section you can install', avoidLabel: 'When not to', placeLabel: 'Place', standalone: 'stands on a page by itself', standaloneInside: 'stands on a page by itself and inside {list}', onlyInside: 'only inside {list}', caseLabel: 'Case', whyLabel: 'Why it fits', installLabel: 'Install', crumbBlocks: 'Blocks' },
  ru: { title: 'Каталог секций', subtitle: 'Все виды секций, которые умеет движок материалов, нарисованные настоящим рендерером на образцовых данных.', countLabel: 'видов', whenLabel: 'Когда уместен', publishedTitle: 'Блоки раздела, которые можно поставить', avoidLabel: 'Когда не брать', placeLabel: 'Место', standalone: 'можно использовать самостоятельно', standaloneInside: 'самостоятельно, а также внутри {list}', onlyInside: 'только внутри {list}', caseLabel: 'Кейс', whyLabel: 'Почему подходит', installLabel: 'Установка', crumbBlocks: 'Блоки' },
}

export function blocksCatalogueUi(lang: string): BlocksCatalogueUi {
  return UI[lang] ?? UI.en
}
