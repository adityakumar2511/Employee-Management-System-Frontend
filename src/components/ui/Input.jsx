"use client"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

const Input = forwardRef(({ className, type = "text", error, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors duration-150",
        error && "border-destructive focus-visible:ring-destructive",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = "Input"
export { Input }
