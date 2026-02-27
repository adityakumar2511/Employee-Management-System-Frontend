"use client"
import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { useToastStore } from "@/hooks/useToast"

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const styles = {
  success: "border-green-200 bg-green-50 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200",
  error: "border-red-200 bg-red-50 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200",
  info: "border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200",
}

const iconStyles = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }) {
  const Icon = icons[toast.type] || Info

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4 shadow-lg pointer-events-auto",
        "animate-slide-in-right",
        styles[toast.type]
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconStyles[toast.type])} />
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-semibold text-sm">{toast.title}</p>}
        <p className="text-sm">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 rounded-md p-0.5 hover:opacity-70 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
