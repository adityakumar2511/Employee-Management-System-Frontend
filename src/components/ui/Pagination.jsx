"use client"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./Button"

export function Pagination({ currentPage, totalPages, onPageChange, className }) {
  if (totalPages <= 1) return null

  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {start > 1 && (
        <>
          <PageBtn page={1} current={currentPage} onClick={onPageChange} />
          {start > 2 && <span className="px-1 text-muted-foreground text-sm">…</span>}
        </>
      )}

      {pages.map((page) => (
        <PageBtn key={page} page={page} current={currentPage} onClick={onPageChange} />
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-muted-foreground text-sm">…</span>}
          <PageBtn page={totalPages} current={currentPage} onClick={onPageChange} />
        </>
      )}

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

function PageBtn({ page, current, onClick }) {
  return (
    <button
      onClick={() => onClick(page)}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors",
        page === current
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-foreground"
      )}
    >
      {page}
    </button>
  )
}
