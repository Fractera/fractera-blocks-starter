"use client"

import { useState } from "react"
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

type Ui = BlocksHomeWords["showcase"]

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

export function CatalogueTable({ rows, ui }: { rows: CatalogueRow[]; ui: Ui }) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState<number>(PAGE_SIZES[0])
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
              <TableRow data-block="ct0r1" key={r.id} className="whitespace-nowrap">
                <TableCell data-block="ct0d1" className="font-mono text-xs">{r.name}</TableCell>
                <TableCell data-block="ct0d2">
                  <a href={r.href} className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline">
                    <Eye className="size-4" aria-hidden />
                    {ui.open}
                  </a>
                </TableCell>
                <TableCell data-block="ct0d3"><Cut text={r.section} width={130} /></TableCell>
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
        onPage={(p) => setPage(Math.min(Math.max(1, p), pages))}
        onSize={(s) => { setPerPage(s); setPage(1) }}
      />
    </TooltipProvider>
  )
}
