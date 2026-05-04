import { create } from "zustand"
import { persist } from "zustand/middleware"
import api from "@/lib/axios"

const isProduction = process.env.NODE_ENV === "production"
const secureFlag = isProduction ? "; Secure" : ""

// const setCookie = (name, value, maxAge) => {
//   document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`
// }

const setCookie = (name, value, maxAge) => {
  const isProduction = process.env.NODE_ENV === "production"
  const secure = isProduction ? "; Secure" : ""
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=None${secure}`
}

const clearCookie = (name) => {
  // ✅ Domain explicitly clear karo — production mein zaroori
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secureFlag}`
  // Vercel domain ke liye bhi clear karo
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secureFlag}; domain=${window.location.hostname}`
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post("/auth/login", credentials)
          const { user, accessToken, refreshToken } = data.data

          localStorage.setItem("accessToken", accessToken)
          localStorage.setItem("refreshToken", refreshToken)

          setCookie("accessToken", accessToken, 15 * 60)
          setCookie("refreshToken", refreshToken, 7 * 24 * 60 * 60)

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          return { success: true, user, role: user.role }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
  try {
    const { refreshToken } = get()
    if (refreshToken) {
      await api.post("/auth/logout", { refreshToken })
    }
  } catch (_) {}

  // Sab clear karo
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("ems-auth")

  clearCookie("accessToken")
  clearCookie("refreshToken")

  // State reset
  set({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    hydrated: true,
  })

  // ✅ Hard redirect — middleware cookie check karega, guaranteed login page
  window.location.href = "/auth/login"
},

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }))
      },

      setForcePasswordChange: (value) => {
        set((state) => ({
          user: { ...state.user, forcePasswordChange: value },
        }))
      },

      getRole: () => get().user?.role || null,
      isAdmin: () => get().user?.role === "ADMIN",
      isEmployee: () => get().user?.role === "EMPLOYEE",
    }),
    {
      name: "ems-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (state) {
          // ✅ Rehydrate par cookies sync karo
          try {
            const accessToken = localStorage.getItem("accessToken")
            const refreshToken = localStorage.getItem("refreshToken")
            if (accessToken) setCookie("accessToken", accessToken, 15 * 60)
            if (refreshToken) setCookie("refreshToken", refreshToken, 7 * 24 * 60 * 60)
          } catch (_) {}

          state.setHydrated()
        } else {
          useAuthStore.setState({ hydrated: true })
        }
      },
    }
  )
)

export default useAuthStore