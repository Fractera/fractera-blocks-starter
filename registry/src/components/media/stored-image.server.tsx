// Картинка материала, лежащая В ХРАНИЛИЩЕ (шаг 506.3).
//
// 🔒 ЭТО И ЕСТЬ ОБРАЗЕЦ, РАДИ КОТОРОГО ВСЁ ЗАТЕВАЛОСЬ (владелец 2026-08-13).
// Материал ссылается на картинку по ИМЕНИ (`media:<файл>`), запись находится в
// хранилище, и оттуда приезжают адрес, размеры и размытая подложка. Владелец
// меняет саму картинку в панели — материал при этом не трогают вовсе, и
// пересборка не нужна.
//
// Асинхронный СЕРВЕРНЫЙ компонент: поиск записи идёт на сервере и кэшируется, в
// браузер уезжает готовая разметка. Клиентскому дереву он не предназначен — там
// не бывает ни доступа к слою данных, ни права ждать ответа.
//
// ЧЕСТНЫЙ ЗАПАСНОЙ ВАРИАНТ. Записи нет — на свежем сервере посев ещё не
// отработал, картинку удалили из панели, хранилище недоступно — материал обязан
// открыться. Тогда рисуется картинка того же имени из хранилища «Блоков» (`registry/assets/blog-media`, дверь `/r/assets`):
// файл едет с проектом как посевной материал, и он на месте.

import { mediaByName, mediaFileUrl } from "@/lib/media/by-name"
import { MediaImage } from "./media-image.server"
import { StaticImage } from "./static-image.server"

export async function StoredImage(
  { name, alt, className, sizes, priority }:
  { name: string; alt: string; className?: string; sizes?: string; priority?: boolean },
) {
  const row = await mediaByName(name)

  if (!row) {
    return <StaticImage src={`/r/assets/blog-media/${name}`} alt={alt} className={className} sizes={sizes} priority={priority} />
  }

  return (
    <MediaImage
      media={{ url: mediaFileUrl(row), width: row.width, height: row.height, blur: row.blur }}
      alt={alt}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  )
}
