"use client"
import { useEffect, useState } from "react"
import { wakeBackend } from "@/lib/backendWaker"

const MESSAGES = [
  "Connecting to server...",
  "Server is waking up, please wait...",
  "This may take 30-60 seconds on first load...",
  "Almost there...",
  "Hang tight, server is starting...",
]

export default function BackendLoader({ children }) {
  const [status, setStatus] = useState("checking") // checking | waking | ready | failed
  const [attempt, setAttempt] = useState(0)
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    // Message rotate karo
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    }, 3000)

    wakeBackend((s, att) => {
      setStatus(s)
      if (att) setAttempt(att)
    }).then((ready) => {
      if (ready) setStatus("ready")
    })

    return () => clearInterval(msgTimer)
  }, [])

  if (status === "ready") return children

  if (status === "failed") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-lg font-medium text-foreground">
            Server unavailable
          </h2>
          <p className="text-sm text-muted-foreground">
            Could not connect to the backend. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Waking / Checking screen
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-sm px-6">
        {/* Spinner */}
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-medium text-foreground">
            Starting EMS Pro
          </h2>
          <p className="text-sm text-muted-foreground min-h-[20px] transition-all">
            {MESSAGES[msgIndex]}
          </p>
          {attempt > 0 && (
            <p className="text-xs text-muted-foreground">
              Attempt {attempt} of 10...
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min((attempt / 10) * 100, 90)}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Free tier servers sleep after inactivity.
          <br />First load takes ~30-60 seconds.
        </p>
      </div>
    </div>
  )
}