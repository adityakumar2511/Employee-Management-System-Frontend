"use client"
import { Modal } from "./Modal"
import { Button } from "./Button"
import { AlertTriangle } from "lucide-react"

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirm", variant = "destructive", loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full",
          variant === "destructive" ? "bg-red-100 dark:bg-red-900/30" : "bg-yellow-100 dark:bg-yellow-900/30"
        )}>
          <AlertTriangle className={cn(
            "h-6 w-6",
            variant === "destructive" ? "text-red-600" : "text-yellow-600"
          )} />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={variant}
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function cn(...args) {
  return args.filter(Boolean).join(" ")
}
