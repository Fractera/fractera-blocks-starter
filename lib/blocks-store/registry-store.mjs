// 549-3: перенесено из blocks v0.5.24 без изменения логики. Корень — ELEMENT_DIR (абсолютный путь от установщика: standalone-сервер
// делает chdir в свою папку); собранный реестр — `registry-out/` (папку `public/` в шаблоне отдаёт Next как статику).
// РЕЕСТР НА ДИСКЕ: `public/r/*.json`, которые собирает `npm run build` (shadcn build). Один источник для API и MCP.
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'

const OUT = join(process.env.ELEMENT_DIR || process.cwd(), 'registry-out')
const SAFE = /^[a-z0-9][a-z0-9-]{0,63}$/

export function registryBuilt() {
  return existsSync(join(OUT, 'registry.json'))
}

export function listItems() {
  const reg = JSON.parse(readFileSync(join(OUT, 'registry.json'), 'utf8'))
  return reg.items.map(({ name, title, description, type, registryDependencies = [], dependencies = [] }) => ({ name, title, description, type, registryDependencies, dependencies }))
}

export function readItem(name) {
  if (!SAFE.test(name) || !existsSync(join(OUT, `${name}.json`))) throw new Error(`No block named «${name}» in this registry. Call list_blocks.`)
  return JSON.parse(readFileSync(join(OUT, `${name}.json`), 'utf8'))
}

export function itemPath(file) {
  const name = file.replace(/\.json$/, '')
  if (name !== 'registry' && !SAFE.test(name)) return null
  const p = join(OUT, `${name}.json`)
  return existsSync(p) ? p : null
}
