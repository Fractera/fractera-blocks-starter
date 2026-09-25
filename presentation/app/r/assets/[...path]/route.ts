// ДВЕРЬ ИЗОБРАЖЕНИЙ БЛОКОВ — `GET /r/assets/<путь>` (2026-09-25).
//
// Слово владельца: «блоки целиком должны возвращаться из микросервиса Блоки». Картинка образца — часть блока, а не
// файл, подложенный по старому пути ядра: она лежит в `registry/assets/` этого репозитория и отдаётся ЭТОЙ дверью.
// Кто бы ни показывал блок — сама витрина, ядро, сайт, — он берёт картинку у «Блоков» по их адресу; копий у себя не держит.
//
// 🔒 ДВЕРЬ — МАРШРУТ NEXT, А НЕ ВЕТКА `server.js`. Оптимизатор `next/image` запрашивает локальную картинку у самого
// Next, минуя внешний сервер: ветка в `server.js` отвечала бы браузеру и молчала бы оптимизатору. `server.js` только
// пропускает `/r/assets/*` сюда. Папку называет `server.js` (`BLOCKS_ASSETS_DIR`), а не рабочая папка процесса.
import { readFile } from "node:fs/promises"
import { join, normalize, sep, extname } from "node:path"

const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
}

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const dir = process.env.BLOCKS_ASSETS_DIR ?? join(process.cwd(), "registry", "assets")
  const file = normalize(join(dir, ...path))
  const type = TYPES[extname(file).toLowerCase()]
  // Выход за папку (`..`) и незнакомый тип — «нет такого», а не ошибка сервера.
  if (!type || !file.startsWith(normalize(dir) + sep)) return new Response("not found", { status: 404 })
  try {
    const body = await readFile(file)
    return new Response(body, {
      headers: {
        "content-type": type,
        "cache-control": "public, max-age=86400",
        "access-control-allow-origin": "*",
      },
    })
  } catch {
    return new Response("not found", { status: 404 })
  }
}
