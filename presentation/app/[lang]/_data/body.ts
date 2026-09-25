// СЛОВА ГЛАВНОЙ СТРАНИЦЫ ЭЛЕМЕНТА «БЛОКИ» — публичной, индексируемой (шаг 297). Сборка в блоки — `../_components/`.
//
// Источник — черновик владельца 2026-09-25 («Блоки представляют из себя готовые решения для быстрого проектирования
// проекта…»), сокращён по его слову: «Оформление должно оставаться лёгким, компактным, хорошо читаемым — ты имеешь
// полное право сократить». Раскладка — по образцу главной корня: ряд мер, ярлыки, карточки, три шага.

export type BlocksHomeWords = {
  title: string
  description: string
  /** 303-2: бейдж и кнопка первого экрана в одну колонку. */
  pill?: string
  cta: { label: string; href: string }
  crumbs: { site: string; blocks: string }
  showcase: { badge: string; title: string; note: string; frameTitle: string; menuTitle: string }
  faqTitle: string
  faq: [{ q: string; a: string }, { q: string; a: string }, { q: string; a: string }]
  metrics: { value: string; label: string }[]
  badges: string[]
  why: { badge: string; title: string; note: string; items: { title: string; text: string }[] }
  who: { badge: string; title: string; note: string; items: { title: string; text: string }[] }
  custom: { badge: string; title: string; note: string; block: { title: string; text: string }; widget: { title: string; text: string } }
  choose: { badge: string; title: string; note: string; steps: [{ title: string; text: string }, { title: string; text: string }, { title: string; text: string }] }
  /** Как менять дизайн блоков агентом (шаг 300). `{terminal}` — адрес терминала раздела «Блоки» в ядре, подставляется при сборке. */
  agent: {
    badge: string
    title: string
    note: string
    steps: [{ title: string; text: string }, { title: string; text: string }, { title: string; text: string }]
    scenarios: { badge: string; title: string; note: string; items: { title: string; text: string }[] }
  }
}

const en: BlocksHomeWords = {
  title: 'Blocks',
  description: 'Ready-made solutions for designing a project quickly: one style, a sane token budget.',
  cta: { label: 'See the blocks', href: '#showcase' },
  crumbs: { site: 'Home', blocks: 'Blocks' },
  showcase: { badge: 'Showcase', title: 'Every block, section by section', note: 'Pick a section on the left — its blocks open on the right, drawn by the real renderer with sample data.', frameTitle: 'Blocks of the selected section', menuTitle: 'Sections' },
  faqTitle: 'Frequently asked questions',
  faq: [
    { q: 'What is a block?', a: 'A self-contained React component of the design system: it takes data and draws one part of a page. A page is a list of blocks filled with data.' },
    { q: 'How does another project get a block?', a: 'Through this element: its API is a shadcn registry, its MCP answers an agent. One command brings the block and everything it depends on into the project.' },
    { q: 'Block or widget?', a: 'A block must suit any page of the project. Unique logic of one route — a calculator, an editor — is a widget.' },
  ],
  metrics: [
    { value: '68', label: 'blocks in the starter kit' },
    { value: '14', label: 'sections by purpose' },
    { value: 'API · MCP', label: 'how any project reaches them' },
  ],
  badges: ['Design system', 'Static pages', 'Search-ready', 'shadcn registry', 'MCP', 'Claude Code Agent', 'Web3 MarketPlace'],
  why: {
    badge: 'Why blocks',
    title: 'One style, fewer tokens',
    note: 'Blocks are ready-made solutions for designing a project quickly — with a sane token budget and one consistent look.',
    items: [
      { title: 'They follow the design system', text: 'Change the theme, the fonts or the spacing in the design system — every block adapts to it.' },
      { title: 'Content without a new deployment', text: 'A page is a list of blocks filled with data. Change the data — the page shows it, no deployment needed.' },
      { title: 'Made for static and search', text: 'Their architecture is built for static pages and maximum search visibility.' },
    ],
  },
  who: {
    badge: 'Who works with them',
    title: 'An agent, other projects, a marketplace',
    note: 'Like every AGI ITEM, blocks answer for themselves.',
    items: [
      { title: 'Claude Code Agent', text: 'Blocks ship with their own agent: change one block or all of them at once.' },
      { title: 'MCP blocks', text: 'Your root site or any other application asks the blocks MCP what a block is for, what types it has and what it requires from data.' },
      { title: 'Web3 MarketPlace', text: 'Create your own blocks and sell them: other projects can reuse them.' },
    ],
  },
  custom: {
    badge: 'Any design',
    title: 'When you need a design of your own',
    note: 'Two ways, and the first one is recommended.',
    block: {
      title: 'A new block',
      text: 'Create a new section and a block with your design — a small badge, a section, or a large page with video graphics. One requirement: the block works as a self-contained React component.',
    },
    widget: {
      title: 'A widget',
      text: 'A block is a unit of atomic design and cannot become a complex tool — a furniture calculator or a video editor. Such functions are built as widgets: they give the widest possibilities an application has.',
    },
  },
  choose: {
    badge: 'How to pick',
    title: 'From a section to a page',
    note: 'The starter kit is split into sections by purpose.',
    steps: [
      { title: 'Open the section', text: 'Hero, pricing, testimonials, dialogs — each section of the [showcase](#showcase) holds the blocks for one purpose.' },
      { title: 'Read the description', text: 'Every block has a description a model reads through MCP to decide whether the block fits the task.' },
      { title: 'Install it', text: 'One command brings the block and everything it depends on into your project.' },
    ],
  },
  agent: {
    badge: 'Change the design',
    title: 'An AI agent changes the blocks for you',
    note: 'Changes to the design of blocks are made by an artificial intelligence agent. Call it from the core of your project — through Telegram or in [the terminal of the Blocks section]({terminal}).',
    steps: [
      { title: 'Open the terminal', text: 'Open [the Blocks tab in the core]({terminal}), activate the subscription and go to the terminal.' },
      { title: 'Send the task', text: 'Pick one of the three scenarios below and send your message to the agent.' },
      { title: 'See the result', text: 'Reload this page: the changed or new block is shown in the [showcase](#showcase) in preview mode.' },
    ],
    scenarios: {
      badge: 'Three scenarios',
      title: 'What to tell the agent',
      note: 'Choose the one that fits your task.',
      items: [
        { title: 'Change a block', text: 'Give the identifier of the block you want to change and describe the change.' },
        { title: 'Create a block', text: 'Describe in detail the block you want to create.' },
        { title: 'Start from a sample', text: 'Open the source code in the browser, copy the code of the block you want to reuse as a sample and send it to the agent.' },
      ],
    },
  },
}

const ru: BlocksHomeWords = {
  title: 'Блоки',
  description: 'Готовые решения для быстрого проектирования проекта: единый стиль и разумный расход токенов.',
  cta: { label: 'Смотреть блоки', href: '#showcase' },
  crumbs: { site: 'Главная', blocks: 'Блоки' },
  showcase: { badge: 'Витрина', title: 'Все блоки, раздел за разделом', note: 'Выберите раздел слева — его блоки откроются справа, нарисованные настоящим рендерером на образцовых данных.', frameTitle: 'Блоки выбранного раздела', menuTitle: 'Разделы' },
  faqTitle: 'Частые вопросы',
  faq: [
    { q: 'Что такое блок?', a: 'Самостоятельный React-компонент дизайн-системы: принимает данные и рисует одну часть страницы. Страница — это список блоков, наполненный данными.' },
    { q: 'Как блок попадает в другой проект?', a: 'Через этот элемент: его API — реестр shadcn, его MCP отвечает агенту. Одна команда приносит в проект блок и всё, от чего он зависит.' },
    { q: 'Блок или виджет?', a: 'Блок обязан подходить любой странице проекта. Уникальная логика одного маршрута — калькулятор, редактор — это виджет.' },
  ],
  metrics: [
    { value: '68', label: 'блоков в стартовом комплекте' },
    { value: '14', label: 'разделов по назначению' },
    { value: 'API · MCP', label: 'как до них доходит любой проект' },
  ],
  badges: ['Дизайн-система', 'Статические страницы', 'Готовы к поиску', 'Реестр shadcn', 'MCP', 'Claude Code Agent', 'Web3 MarketPlace'],
  why: {
    badge: 'Зачем блоки',
    title: 'Единый стиль, меньше токенов',
    note: 'Блоки — готовые решения для быстрого проектирования проекта: разумный расход токенов и единый стиль оформления.',
    items: [
      { title: 'Подчиняются дизайн-системе', text: 'Поменяли тему, шрифты или отступы в дизайн-системе — все блоки подстроились.' },
      { title: 'Контент без нового развёртывания', text: 'Страница — это список блоков, наполненный данными. Поменялись данные — страница их показывает, развёртывание не нужно.' },
      { title: 'Созданы для статики и поиска', text: 'Их архитектура рассчитана на статические страницы и максимальную видимость в поиске.' },
    ],
  },
  who: {
    badge: 'Кто с ними работает',
    title: 'Агент, другие проекты, маркетплейс',
    note: 'Как любой AGI ITEM, блоки отвечают за себя сами.',
    items: [
      { title: 'Claude Code Agent', text: 'Блоки поставляются со своим агентом: меняйте один блок или все сразу.' },
      { title: 'MCP blocks', text: 'Ваш корневой сайт или любое другое приложение спрашивает MCP блоков, для чего блок, какие у него типы и что он требует от данных.' },
      { title: 'Web3 MarketPlace', text: 'Создавайте свои блоки и продавайте их: другие проекты смогут их переиспользовать.' },
    ],
  },
  custom: {
    badge: 'Любой дизайн',
    title: 'Когда нужен свой дизайн',
    note: 'Два пути, и первый — рекомендуемый.',
    block: {
      title: 'Новый блок',
      text: 'Создайте новый раздел и блок со своим дизайном — маленький бейдж, секцию или большую страницу с видеографикой. Требование одно: блок работает как самостоятельный React-компонент.',
    },
    widget: {
      title: 'Виджет',
      text: 'Блок — единица атомарного дизайна и не превращается в сложный инструмент вроде калькулятора мебели или видеоредактора. Такие функции строятся виджетами: они дают самые широкие возможности приложения.',
    },
  },
  choose: {
    badge: 'Как выбрать',
    title: 'От раздела к странице',
    note: 'Стартовый комплект разделён на разделы по назначению.',
    steps: [
      { title: 'Откройте раздел', text: 'Герой, цены, отзывы, модальные окна — в каждом разделе [витрины](#showcase) блоки одного назначения.' },
      { title: 'Прочитайте описание', text: 'У каждого блока есть описание: модель читает его через MCP и решает, подходит ли блок для задачи.' },
      { title: 'Поставьте', text: 'Одна команда приносит в проект блок и всё, от чего он зависит.' },
    ],
  },
  agent: {
    badge: 'Изменить дизайн',
    title: 'Блоки меняет ИИ-агент',
    note: 'Изменения в дизайн блоков вносит агент искусственного интеллекта. Он вызывается из ядра проекта — через Telegram или в [терминале раздела «Блоки»]({terminal}).',
    steps: [
      { title: 'Откройте терминал', text: 'Откройте [вкладку «Блоки» в ядре]({terminal}), активируйте подписку и перейдите в терминал.' },
      { title: 'Отправьте задачу', text: 'Выберите один из трёх сценариев ниже и отправьте сообщение агенту.' },
      { title: 'Посмотрите результат', text: 'Обновите эту страницу: изменённый или новый блок появится в [витрине](#showcase) в режиме превью.' },
    ],
    scenarios: {
      badge: 'Три сценария',
      title: 'Что сообщить агенту',
      note: 'Выберите тот, что подходит вашей задаче.',
      items: [
        { title: 'Изменить блок', text: 'Сообщите идентификатор блока, в который хотите внести изменения, и опишите правку.' },
        { title: 'Создать блок', text: 'Детально опишите блок, который хотите создать.' },
        { title: 'Взять образец', text: 'Откройте исходный код в браузере, скопируйте код блока, который хотите переиспользовать как образец, и отправьте его агенту.' },
      ],
    },
  },
}

const WORDS: Record<string, BlocksHomeWords> = { en, ru }

export function blocksHomeWords(lang: string): BlocksHomeWords {
  return WORDS[lang] ?? en
}

export const LANGS = Object.keys(WORDS)
