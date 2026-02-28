import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

// Zustand persist se token nikalo (ems-auth key mein stored hai)
function getTokens() {
  try {
    const raw = localStorage.getItem("ems-auth")
    if (!raw) return { accessToken: null, refreshToken: null }
    const parsed = JSON.parse(raw)
    return {
      accessToken: parsed?.state?.accessToken || null,
      refreshToken: parsed?.state?.refreshToken || null,
    }
  } catch {
    return { accessToken: null, refreshToken: null }
  }
}

// Zustand persist mein naye tokens save karo
function saveTokens(accessToken, refreshToken) {
  try {
    const raw = localStorage.getItem("ems-auth")
    const parsed = raw ? JSON.parse(raw) : { state: {} }
    parsed.state.accessToken = accessToken
    parsed.state.refreshToken = refreshToken
    localStorage.setItem("ems-auth", JSON.stringify(parsed))
  } catch {}
}

// Request interceptor — attach access token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const { accessToken } = getTokens()
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401 + token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Refresh endpoint khud 401 de toh seedha redirect — loop nahi
    if (originalRequest.url?.includes("/auth/refresh")) {
      clearAuthAndRedirect()
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {

      // Agar refresh already chal raha hai toh queue mein daalo
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { refreshToken } = getTokens()
        if (!refreshToken) {
          clearAuthAndRedirect()
          return Promise.reject(error)
        }

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken, refreshToken: newRefreshToken } = data.data

        // Zustand persist storage mein save karo
        saveTokens(accessToken, newRefreshToken)

        // Default header bhi update karo
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        processQueue(null, accessToken)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuthAndRedirect()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

function clearAuthAndRedirect() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ems-auth")
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    window.location.href = "/auth/login"
  }
}

export default api