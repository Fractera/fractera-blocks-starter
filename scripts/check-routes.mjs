// СТОРОЖ МАРШРУТОВ (шаг 298, 2026-09-25): маршрутные файлы сайта — ЗАКРЫТЫЙ СПИСОК.
//
// ✗ Измерено на этом сервисе: 300 страниц отдельными `page.tsx` собирались 1252 с, те же 300 страниц одним шаблоном — 98 с.
// Каждый файл маршрута Next компилирует и проверяет отдельно; ядро узла дошло так до 126 страниц-копий и 5–7 минут
// компиляции. Поэтому новая страница — это ПАПКА В `presentation/content/`, а не новый `page.tsx`
// (навык `.claude/skills/use-page-tree`).
//
// Файл вне списка — отказ сборки. Настоящее исключение (страница с поведением, которое не складывается из блоков
// каталога) добавляется в ALLOWED ВМЕСТЕ с причиной — решение, а не привычка.
// 🛑 Папка `presentation/pages/` — это Pages Router Next: любая папка там стала бы маршрутом. Запрещена.
import { readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'presentation')
const ROUTE_FILE = /^(page|route|default|sitemap|robots|manifest)\.(tsx?|jsx?)$/

const ALLOWED = new Map([
  ['app/api/settings/changed/route.ts', 'сигнал CONFIG «версия сменилась» — настройки блоков на лету (узел, шаг 308)'],
  ['app/[lang]/page.tsx', 'главная элемента'],
  ['app/[lang]/index.md/route.ts', 'главная для агентов (markdown)'],
  ['app/[lang]/[collection]/[[...slug]]/page.tsx', 'ШАБЛОН дерева страниц — все страницы коллекций'],
  ['app/showcase/[lang]/[section]/page.tsx', 'шаблон витрины разделов блоков'],
  ['app/r/assets/[...path]/route.ts', 'дверь изображений блоков'],
  ['app/sitemap.ts', 'карта сайта'],
  ['app/robots.ts', 'robots.txt'],
])

const found = []
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (ROUTE_FILE.test(name)) found.push(relative(ROOT, p).split(sep).join('/'))
  }
}
walk(join(ROOT, 'app'))

const extra = found.filter((f) => !ALLOWED.has(f))
const pagesRouter = existsSync(join(ROOT, 'pages'))
if (extra.length || pagesRouter) {
  console.error('===ROUTES_FAILED=== маршрутный файл вне закрытого списка:')
  for (const f of extra) console.error(`  ${f}`)
  if (pagesRouter) console.error('  presentation/pages/ — это Pages Router Next, папка запрещена')
  console.error('Новая страница = папка presentation/content/<коллекция>/<slug>/ (meta.json + <lang>.json), а не page.tsx.')
  console.error('Навык: .claude/skills/use-page-tree. Настоящее исключение — строкой в ALLOWED этого файла, с причиной.')
  process.exit(1)
}
const missing = [...ALLOWED.keys()].filter((f) => !found.includes(f))
if (missing.length) console.warn(`[check-routes] в списке, но файла нет (строку убрать): ${missing.join(', ')}`)
console.log(`===ROUTES_OK=== маршрутных файлов ${found.length}, все в закрытом списке`)
