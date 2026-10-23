"use client"

// Подвал таблицы каталога (577-10): сколько записей, размер страницы и переходы — тем же составом, что у таблицы учётных записей
// (счёт слева, выбор размера и стрелки справа; стрелки видны всегда, погашенная значит «дальше некуда»). Свой, а не общий: фрагменты
// между виджетами не делятся.

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationNext, PaginationPrevious, PaginationFirst, PaginationLast,
} from "@/components/ui/pagination"
import { Small } from "@/components/ui/typography"
import type { BlocksHomeWords } from "./body.i18n"

export const PAGE_SIZES = [10, 20, 50] as const

export function CataloguePager(
  { ui, total, page, pages, perPage, onPage, onSize }: {
    ui: BlocksHomeWords["showcase"]
    total: number
    page: number
    pages: number
    perPage: number
    onPage: (p: number) => void
    onSize: (s: number) => void
  },
) {
  const off = (yes: boolean) => (yes ? "pointer-events-none opacity-40" : "")
  return (
    <div data-block="cp0p1" className="mt-3 flex flex-wrap items-center justify-between gap-2">
      <Small data-block="cp0p2">{ui.count.replace("{count}", String(total))}</Small>
      <div data-block="cp0p3" className="flex items-center gap-1.5 sm:gap-3">
        <div data-block="cp0p4" className="flex items-center gap-1">
          <span className="hidden text-[10px] text-muted-foreground sm:inline">{ui.perPage}</span>
          <Select value={String(perPage)} onValueChange={(v) => onSize(Number(v))}>
            <SelectTrigger className="h-7 w-[60px] px-2 text-xs" aria-label={ui.perPage}><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => <SelectItem key={s} value={String(s)} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationFirst title={ui.first} aria-disabled={page <= 1} className={off(page <= 1)} onClick={() => onPage(1)} />
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious title={ui.prev} aria-disabled={page <= 1} className={off(page <= 1)} onClick={() => onPage(page - 1)} />
            </PaginationItem>
            <PaginationItem>
              <span className="px-1 text-[10px] tabular-nums text-muted-foreground sm:hidden">{page}/{pages}</span>
              <span className="hidden px-2 text-[10px] text-muted-foreground sm:inline">
                {ui.pageOf.replace("{page}", String(page)).replace("{pages}", String(pages))}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext title={ui.next} aria-disabled={page >= pages} className={off(page >= pages)} onClick={() => onPage(page + 1)} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLast title={ui.last} aria-disabled={page >= pages} className={off(page >= pages)} onClick={() => onPage(pages)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
