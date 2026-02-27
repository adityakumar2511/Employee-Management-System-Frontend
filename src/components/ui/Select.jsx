"use client"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const Select = forwardRef(({ className, children, error, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "flex h-9 w-full appearance-none rounded-lg border border-input bg-background",
          "px-3 py-2 pr-8 text-sm shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors duration-150",
          error && "border-destructive focus:ring-destructive",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
})

Select.displayName = "Select"
export { Select }
