import { create } from "zustand"
import { persist } from "zustand/middleware"
import api from "@/lib/axios"

// ─── Cookie helpers ───────────────────────────────────────────────────────────

const setCookie = (name, value, maxAge) => {
  const isProduction = process.env.NODE_ENV === "production"
  // ✅ SameSite=Lax — same-origin Vercel deployment ke liye correct
  // SameSite=None sirf cross-site (different domains) ke liye chahiye
  const secure = isProduction ? "; Secure" : ""
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`
}

const clearCookie = (name) => {
  const isProduction = process.env.NODE_ENV === "production"
  const secure = isProduction ? "; Secure" : ""
  // Current hostname pe clear karo
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secure}`
  // Vercel domain ke liye bhi clear karo (subdomain edge case)
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secure}; domain=${window.location.hostname}`
}

// ─── Store ────────────────────────────────────────────────────────────────────

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

          // localStorage mein save karo (axios interceptor ke liye)
          localStorage.setItem("accessToken", accessToken)
          localStorage.setItem("refreshToken", refreshToken)

          // ✅ SameSite=Lax ke saath cookies set karo
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

        // Hard redirect — middleware guaranteed login page dikhayega
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
          // ✅ Rehydrate hone par cookies sync karo (page refresh ke baad bhi kaam kare)
          try {
            const accessToken = localStorage.getItem("accessToken")
            const refreshToken = localStorage.getItem("refreshToken")
            if (accessToken) setCookie("accessToken", accessToken, 15 * 60)
            if (refreshToken)
              setCookie("refreshToken", refreshToken, 7 * 24 * 60 * 60)
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