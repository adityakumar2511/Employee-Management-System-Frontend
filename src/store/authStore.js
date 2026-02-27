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

          localStorage.setItem("accessToken", accessToken)
          localStorage.setItem("refreshToken", refreshToken)

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          return { success: true, role: user.role }
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
        // Dono cases mein hydrated true karo:
        // 1. Storage mein data tha aur load ho gaya (state exists)
        // 2. Storage empty thi ya error aayi (fresh user)
        if (state) {
          state.setHydrated()
        } else {
          // Fresh user — directly store update karo
          useAuthStore.setState({ hydrated: true })
        }
      },
    }
  )
)

export default useAuthStore