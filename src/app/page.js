"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useAuthStore from "@/store/authStore"
import { Spinner } from "@/components/ui/Spinner"

export default function RootPage() {
  const router = useRouter()
  const { isAuthenticated, user, hydrated } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !hydrated) return

    if (isAuthenticated && user) {
      router.replace(user.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard")
    } else {
      router.replace("/auth/login")
    }
  }, [mounted, hydrated, isAuthenticated, user, router])

  if (!mounted) return null

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
          <span className="text-xl font-bold text-white">E</span>
        </div>
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading EMS Pro...</p>
      </div>
    </div>
  )
}