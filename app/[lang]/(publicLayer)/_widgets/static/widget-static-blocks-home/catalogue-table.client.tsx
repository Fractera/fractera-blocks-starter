"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import type { CatalogueRow } from "@/app/showcase/_data/catalogue-rows"
import { CataloguePager, PAGE_SIZES } from "./catalogue-pager.client"
import type { BlocksHomeWords } from "./body.i18n"

// ТАБЛИЦА КАТАЛОГА НА ГЛАВНОЙ «БЛОКОВ» (шаг узла 577-10) — вместо рабочего экрана «меню разделов + окно». Владелец 2026-10-23: «обычную
// таблицу с пагинацией … все записи могут иметь максимум одну строку и максимум 200 пикселей в ширину для описания после чего идёт… , при
// наведении мы получаем полный текст ячейки, а … вторая колонка будет называться Preview».
// 🔒 Строки приходят пропсами со статической страницы (все сразу, их считает `catalogue-rows.ts`); здесь только листание — без запросов.
// 🔒 Каждая ячейка — одна строка (`whitespace-nowrap`); длинные (описание, место, раздел) режутся по 200 px многоточием, полный текст —
// подсказкой при наведении и в `title` (без скрипта и для чтения с экрана).
// 🔒 577-12 (владелец 2026-10-23: «когда я изменяю количество элементов в таблице это нужно запомнить где-то в локальном хранилище
// браузера … прокрутить нужно будет обратно к тому же самому элементу таблицы»): размер страницы, номер страницы и строка, у которой
// нажали Preview, — в `localStorage`; при возврате таблица там же и показывает эту строку. Хранилище закрыто — первая страница, без ошибки.

type Ui = BlocksHomeWords["showcase"]
type Saved = { perPage?: number; page?: number; row?: string }

// Ключ — своя таблица: главная (`all`) и каждая страница раздела помнят своё место.
const KEY = (scope: string) => `blocks-catalogue-table:${scope}`
function load(scope: string): Saved {
  try { return JSON.parse(window.localStorage.getItem(KEY(scope)) ?? "{}") as Saved } catch { return {} }
}
function save(scope: string, patch: Saved) {
  try { window.localStorage.setItem(KEY(scope), JSON.stringify({ ...load(scope), ...patch })) } catch { /* хранилище закрыто */ }
}

/** `width` — the cut in px: 200 for the description (the owner's number), narrower for section and place so all columns fit the page. */
function Cut({ text, width = 200 }: { text: string; width?: number }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span data-block="ct0c1" title={text} style={{ maxWidth: width }} className="block truncate">{text}</span>
      </TooltipTrigger>
      <TooltipContent data-block="ct0c2" className="max-w-sm">{text}</TooltipContent>
    </Tooltip>
  )
}

export function CatalogueTable({ rows, ui, scope = "all" }: { rows: CatalogueRow[]; ui: Ui; scope?: string }) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState<number>(PAGE_SIZES[0])
  const [mark, setMark] = useState<string | null>(null)
  // Возврат: настройка и строка — из хранилища, затем мгновенная прокрутка к строке (плавная не доводит до места).
  useEffect(() => {
    const s = load(scope)
    const size = PAGE_SIZES.includes(s.perPage as (typeof PAGE_SIZES)[number]) ? (s.perPage as number) : PAGE_SIZES[0]
    const at = s.row ? rows.findIndex((r) => r.id === s.row) : -1
    setPerPage(size)
    setPage(at >= 0 ? Math.floor(at / size) + 1 : Math.max(1, Math.min(s.page ?? 1, Math.ceil(rows.length / size) || 1)))
    if (at >= 0) setMark(s.row ?? null)
  }, [rows, scope])
  useEffect(() => {
    if (!mark) return
    document.querySelector(`[data-row="${CSS.escape(mark)}"]`)?.scrollIntoView({ block: "center", behavior: "instant" })
    const t = setTimeout(() => setMark(null), 1500)
    return () => clearTimeout(t)
  }, [mark, page])
  const pages = Math.max(1, Math.ceil(rows.length / perPage))
  const shown = rows.slice((page - 1) * perPage, page * perPage)
  return (
    <TooltipProvider delayDuration={200}>
      <div data-block="ct0t1" className="mt-8 rounded-2xl border border-border">
        <Table data-block="ct0t2">
          <TableHeader data-block="ct0t3">
            <TableRow data-block="ct0t4">
              <TableHead data-block="ct0h1">{ui.cols.name}</TableHead>
              <TableHead data-block="ct0h2">{ui.cols.preview}</TableHead>
              <TableHead data-block="ct0h3">{ui.cols.section}</TableHead>
              <TableHead data-block="ct0h4">{ui.cols.description}</TableHead>
              <TableHead data-block="ct0h5">{ui.cols.place}</TableHead>
              <TableHead data-block="ct0h6">{ui.cols.kind}</TableHead>
              <TableHead data-block="ct0h7">{ui.cols.version}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody data-block="ct0t5">
            {shown.map((r) => (
              <TableRow data-block="ct0r1" key={r.id} data-row={r.id} className={`whitespace-nowrap transition-colors ${mark === r.id ? "bg-primary/10" : ""}`}>
                <TableCell data-block="ct0d1" className="font-mono text-xs">{r.name}</TableCell>
                <TableCell data-block="ct0d2">
                  <a href={r.href} onClick={() => save(scope, { row: r.id, page, perPage })} className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline">
                    <Eye className="size-4" aria-hidden />
                    {ui.open}
                  </a>
                </TableCell>
                <TableCell data-block="ct0d3"><a href={`/showcase/${r.href.split("/")[2]}/preview/${r.sectionId}`} className="hover:underline"><Cut text={r.section} width={130} /></a></TableCell>
                <TableCell data-block="ct0d4"><Cut text={r.description} /></TableCell>
                <TableCell data-block="ct0d5"><Cut text={r.place} width={130} /></TableCell>
                <TableCell data-block="ct0d6">
                  <Badge data-block="ct0d7" variant={r.kind === "block" ? "default" : "outline"}>{r.kind === "block" ? ui.kinds.block : ui.kinds.sample}</Badge>
                </TableCell>
                <TableCell data-block="ct0d8" className="tabular-nums text-muted-foreground">{r.version}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <CataloguePager
        ui={ui}
        total={rows.length}
        page={page}
        pages={pages}
        perPage={perPage}
        onPage={(p) => { const n = Math.min(Math.max(1, p), pages); setPage(n); save(scope, { page: n, row: undefined }) }}
        onSize={(s) => { setPerPage(s); setPage(1); save(scope, { perPage: s, page: 1, row: undefined }) }}
      />
    </TooltipProvider>
  )
}
