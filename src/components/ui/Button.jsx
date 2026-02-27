"use client"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const variants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
  success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
  warning: "bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm",
}

const sizes = {
  default: "h-9 px-4 py-2 text-sm",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-11 rounded-md px-8 text-base",
  icon: "h-9 w-9",
  "icon-sm": "h-8 w-8",
}

const Button = forwardRef(
  ({ className, variant = "default", size = "default", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium",
          "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
export { Button }
