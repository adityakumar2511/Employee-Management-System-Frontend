"use client"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"

const sizes = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
}

const colors = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-red-100 text-red-700",
  "bg-indigo-100 text-indigo-700",
]

function getColorFromName(name) {
  if (!name) return colors[0]
  const charCode = name.charCodeAt(0)
  return colors[charCode % colors.length]
}

export function Avatar({ name, src, size = "md", className }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        className={cn("rounded-full object-cover flex-shrink-0", sizes[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold flex-shrink-0",
        sizes[size],
        getColorFromName(name),
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
