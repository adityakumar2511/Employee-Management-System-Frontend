import { useCallback } from "react"
import { useRouter } from "next/navigation"
import useAuthStore from "@/store/authStore"

export function useAuth() {
  const router = useRouter()
  const {
    user,
    isAuthenticated,
    isLoading,
    hydrated,
    login: storeLogin,
    logout: storeLogout,
    getRole,
    isAdmin,
    isEmployee,
    updateUser,
  } = useAuthStore()

  const login = useCallback(
    async (credentials) => {
      const result = await storeLogin(credentials)
      if (result.success) {
        // ✅ router.replace — back button se login pe nahi jaayega
        if (result.role === "ADMIN") {
          router.replace("/admin/dashboard")
        } else {
          router.replace("/employee/dashboard")
        }
      }
      return result
    },
    [storeLogin, router]
  )

  const logout = useCallback(async () => {
    await storeLogout() // state + localStorage + cookies clear

    // ✅ Ek hi redirect — router.replace (no conflict)
    // window.location.replace nahi — router hi kaafi hai
    // router.replace("/auth/login")
  }, [storeLogout, router])

  const requireAuth = useCallback(
    (requiredRole = null) => {
      if (!isAuthenticated) {
        router.replace("/auth/login")
        return false
      }
      if (requiredRole && getRole() !== requiredRole) {
        router.replace(
          getRole() === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard"
        )
        return false
      }
      return true
    },
    [isAuthenticated, getRole, router]
  )

  return {
    user,
    isAuthenticated,
    isLoading,
    hydrated,
    login,
    logout,
    requireAuth,
    getRole,
    isAdmin,
    isEmployee,
    updateUser,
  }
}