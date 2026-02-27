"use client"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function SearchInput({ placeholder = "Search...", value, onChange, className, onClear }) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "transition-colors duration-150",
          value && "pr-8"
        )}
      />
      {value && (
        <button
          onClick={() => {
            onChange("")
            onClear?.()
          }}
          className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
