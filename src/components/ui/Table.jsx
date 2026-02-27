"use client"
import { cn } from "@/lib/utils"

export function Table({ className, children, ...props }) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn("data-table", className)} {...props}>
        {children}
      </table>
    </div>
  )
}

export function TableHead({ children }) {
  return <thead className="border-b border-border bg-muted/30">{children}</thead>
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>
}

export function TableRow({ className, children, ...props }) {
  return (
    <tr
      className={cn("border-b border-border hover:bg-muted/30 transition-colors", className)}
      {...props}
    >
      {children}
    </tr>
  )
}

export function Th({ className, children, ...props }) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap",
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

export function Td({ className, children, ...props }) {
  return (
    <td
      className={cn("px-4 py-3 text-sm text-foreground", className)}
      {...props}
    >
      {children}
    </td>
  )
}

export function EmptyRow({ colSpan, message = "No data found" }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">📋</span>
          <span>{message}</span>
        </div>
      </td>
    </tr>
  )
}
