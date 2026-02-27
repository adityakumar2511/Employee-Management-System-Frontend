"use client"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Button } from "./Button"

export function Modal({ isOpen, onClose, title, description, children, size = "md", className }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl",
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose?.()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
      
      {/* Modal */}
      <div
        className={cn(
          "relative z-10 w-full rounded-2xl border bg-card shadow-2xl",
          "animate-fade-in",
          sizes[size],
          className
        )}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between p-5 border-b">
            <div>
              {title && <h2 className="text-lg font-semibold">{title}</h2>}
              {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
            </div>
            {onClose && (
              <Button variant="ghost" size="icon-sm" onClick={onClose} className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
