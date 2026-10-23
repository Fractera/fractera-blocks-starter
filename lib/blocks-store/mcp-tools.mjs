// 549-3: перенесено из blocks v0.5.24 без изменения логики. Корень — ELEMENT_DIR (абсолютный путь от установщика: standalone-сервер
// делает chdir в свою папку); собранный реестр — `registry-out/` (папку `public/` в шаблоне отдаёт Next как статику).
// КОМАНДЫ ЭЛЕМЕНТА «БЛОКИ» — то, что его MCP умеет (шаг 297). Каркас MCP — `mcp/serve-mcp.js`, он общий для любой службы.
import { z } from 'zod'
import { readItem, listItems } from './registry-store.mjs'
import { find } from './find.mjs'

export function blocksTools(publicUrl) {
  const registryUrl = `${publicUrl.replace(/\/+$/, '')}/r/{name}.json`
  return [
    {
      name: 'list_blocks',
      title: 'List blocks',
      description: 'Every block this registry serves: name, title, description, type and the blocks it depends on.',
      run: () => listItems(),
    },
    {
      // 577-4: the same ranking as the door GET /api/block-find (cases, when to use, title, section) instead of a substring;
      // five at most, each with its closest case, placement and install command.
      name: 'search_blocks',
      title: 'Search blocks',
      description: 'The blocks that fit a need in plain words, best first, five at most: name, closest case, placement (standalone or inside which blocks) and the install command.',
      inputSchema: { query: z.string().min(1), collection: z.string().optional() },
      run: ({ query, collection }) => find({ q: query, collection }).results ?? [],
    },
    {
      name: 'get_block',
      title: 'Get a block',
      description: 'One block in full: its files with source code, npm dependencies and registry dependencies.',
      inputSchema: { name: z.string().min(1) },
      run: ({ name }) => readItem(name),
    },
    {
      name: 'install_instructions',
      title: 'How to install a block',
      description: 'The exact steps to install a block into a Next.js project with the shadcn CLI from this registry.',
      inputSchema: { name: z.string().min(1) },
      run: ({ name }) => {
        readItem(name)
        return {
          componentsJson: { registries: { '@fractera': registryUrl } },
          command: `npx shadcn@latest add @fractera/${name}`,
          note: 'Add the registry to components.json once; the command then brings the block and every block it depends on.',
        }
      },
    },
  ]
}
