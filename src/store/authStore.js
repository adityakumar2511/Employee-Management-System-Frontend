import { create } from "zustand"
import { persist } from "zustand/middleware"
import api from "@/lib/axios"

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

          // localStorage mein save karo
          localStorage.setItem("accessToken", accessToken)
          localStorage.setItem("refreshToken", refreshToken)

          // Cookie mein bhi save karo — middleware isi se check karta hai
          document.cookie = `accessToken=${accessToken}; path=/; max-age=${15 * 60}; SameSite=Lax`
          document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`

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
          await api.post("/auth/logout")
        } catch (_) {}

        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")

        // Cookie bhi clear karo
        document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax"
        document.cookie = "refreshToken=; path=/; max-age=0; SameSite=Lax"

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
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
          // localStorage se token uthao aur cookie refresh karo
          const accessToken = localStorage.getItem("accessToken")
          const refreshToken = localStorage.getItem("refreshToken")

          if (accessToken) {
            document.cookie = `accessToken=${accessToken}; path=/; max-age=${15 * 60}; SameSite=Lax`
          }
          if (refreshToken) {
            document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
          }

          state.setHydrated()
        } else {
          useAuthStore.setState({ hydrated: true })
        }
      },
    }
  )
)

export default useAuthStore