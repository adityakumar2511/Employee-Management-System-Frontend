"use client"
import { create } from "zustand"

let toastId = 0

const useToastStore = create((set) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = ++toastId
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, toast.duration || 4000)
    return id
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))

export function useToast() {
  const { addToast, removeToast } = useToastStore()

  const toast = {
    success: (message, options = {}) => addToast({ type: "success", message, ...options }),
    error: (message, options = {}) => addToast({ type: "error", message, ...options }),
    info: (message, options = {}) => addToast({ type: "info", message, ...options }),
    warning: (message, options = {}) => addToast({ type: "warning", message, ...options }),
  }

  return { toast, removeToast }
}

export { useToastStore }
