// ВИД РЕЕСТРА ДЛЯ САЙТА ЭЛЕМЕНТА «БЛОКИ» (узел, шаг 549-3). Запуск: `node scripts/registry-view.mjs` (первым шагом prebuild).
//
// Исходники реестра (`registry/src`) написаны для ЧУЖОГО проекта: внутри они импортируют `@/…`. Сайт элемента — тоже проект на `@/…`
// (нативный шаблон), и 80 из 216 файлов реестра лежат по тем же путям, что файлы шаблона (22 различаются). Прежний сайт решал это
// двумя путями одного псевдонима; в шаблоне это подменило бы либо шаблону его модули, либо витрине её блоки.
// Поэтому витрина и главная читают реестр через свой псевдоним `@reg/*` → `.registry-view/*`: это копия `registry/src`, в которой
// `@/` заменено на `@reg/`. Раздаваемый реестр (`registry/src`, `shadcn build`) не меняется ни на байт. Папка вне git (`.gitignore`).
import { cpSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'registry', 'src')
const OUT = join(ROOT, '.registry-view')
const CODE = /\.(tsx?|jsx?|mjs|cjs)$/

rmSync(OUT, { recursive: true, force: true })
cpSync(SRC, OUT, { recursive: true })
let files = 0
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) { walk(p); continue }
    if (!CODE.test(name)) continue
    const t = readFileSync(p, 'utf8')
    const r = t.replace(/(from\s+|import\s*\(\s*|import\s+)(['"])@\//g, '$1$2@reg/')
    if (r !== t) { writeFileSync(p, r); files++ }
  }
}
walk(OUT)
console.log(`===REGISTRY_VIEW_OK=== .registry-view: импорты @/ → @reg/ в ${files} файлах`)
