"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useAuthStore from "@/store/authStore"
import { useWakeUpBackend } from "@/hooks/useWakeUpBackend"

export default function RootPage() {
  const router = useRouter()
  const { isAuthenticated, user, hydrated } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const backendStatus = useWakeUpBackend() // 👈 yeh add karo

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // backendStatus "ready" hone tak wait karo
    if (!mounted || !hydrated || backendStatus !== "ready") return

    if (isAuthenticated && user) {
      router.replace(
        user.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard"
      )
    } else {
      router.replace("/auth/login")
    }
  }, [mounted, hydrated, isAuthenticated, user, router, backendStatus])

  // ─── Loading UI ───────────────────────────────────────────────
  const getMessage = () => {
    if (backendStatus === "sleeping" || backendStatus === "waking")
      return "Server start ho raha hai, please wait..."
    if (backendStatus === "error")
      return "Server se connect nahi ho pa raha. Please refresh karo."
    return "Loading EMS Pro..."
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
          <span className="text-xl font-bold text-white">E</span>
        </div>

        {backendStatus !== "error" ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Retry
          </button>
        )}

        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {getMessage()}
        </p>

        {(backendStatus === "sleeping" || backendStatus === "waking") && (
          <p className="text-xs text-muted-foreground opacity-60">
            Free server cold start hota hai ~30-60 seconds
          </p>
        )}
      </div>
    </div>
  )
}