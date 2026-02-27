"use client"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

const Textarea = forwardRef(({ className, error, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        "transition-colors duration-150",
        error && "border-destructive focus-visible:ring-destructive",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Textarea.displayName = "Textarea"
export { Textarea }
