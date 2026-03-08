import { useState, useEffect } from "react"

export function useWakeUpBackend() {
  const [backendStatus, setBackendStatus] = useState("sleeping")

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const backendUrl = apiUrl?.replace("/api", "") // /api hata ke base URL banao

    if (!backendUrl) {
      setBackendStatus("ready")
      return
    }

    let attempts = 0
    const maxAttempts = 15
    let timeoutId

    const ping = async () => {
      try {
        setBackendStatus("waking")
        const res = await fetch(`${backendUrl}/health`, {
          signal: AbortSignal.timeout(5000),
        })
        if (res.ok) {
          setBackendStatus("ready")
          return
        }
      } catch (err) {
        // retry karega
      }

      attempts++
      if (attempts >= maxAttempts) {
        setBackendStatus("error")
        return
      }

      timeoutId = setTimeout(ping, 5000)
    }

    ping()
    return () => clearTimeout(timeoutId)
  }, [])

  return backendStatus
}