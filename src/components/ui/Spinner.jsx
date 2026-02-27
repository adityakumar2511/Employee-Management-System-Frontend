"use client"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export function Spinner({ size = "default", className }) {
  const sizes = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  }

  return (
    <Loader2
      className={cn("animate-spin text-primary", sizes[size], className)}
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="shimmer h-4 rounded" />
        </td>
      ))}
    </tr>
  )
}
