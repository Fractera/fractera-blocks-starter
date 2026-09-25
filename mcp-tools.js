// КОМАНДЫ ЭЛЕМЕНТА «БЛОКИ» — то, что его MCP умеет (шаг 297). Каркас MCP — `mcp/serve-mcp.js`, он общий для любой службы.
import { z } from 'zod'
import { readItem, listItems } from './registry-store.js'

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
      name: 'search_blocks',
      title: 'Search blocks',
      description: 'Blocks whose name, title or description contains the query (case-insensitive).',
      inputSchema: { query: z.string().min(1) },
      run: ({ query }) => {
        const q = query.toLowerCase()
        return listItems().filter((i) => [i.name, i.title, i.description].join(' ').toLowerCase().includes(q))
      },
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
