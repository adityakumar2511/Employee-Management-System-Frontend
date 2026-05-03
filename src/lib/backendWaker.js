const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"
const HEALTH_ENDPOINT = `${BACKEND_URL}/health`
const MAX_RETRIES = 10
const RETRY_INTERVAL = 3000 // 3 sec

let wakePromise = null

export async function wakeBackend(onStatus) {
  // Agar already wake process chal raha hai toh same promise return karo
  if (wakePromise) return wakePromise

  wakePromise = _wake(onStatus).finally(() => {
    wakePromise = null
  })

  return wakePromise
}

async function _wake(onStatus) {
  onStatus?.("waking") // "Backend start ho raha hai..."

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(HEALTH_ENDPOINT, {
        method: "GET",
        signal: AbortSignal.timeout(5000), // 5s per attempt
      })

      if (res.ok) {
        onStatus?.("ready") // "Backend ready!"
        return true
      }
    } catch {
      // Backend abhi so raha hai — retry
    }

    onStatus?.("waking", attempt)
    await new Promise((res) => setTimeout(res, RETRY_INTERVAL))
  }

  onStatus?.("failed")
  return false
}