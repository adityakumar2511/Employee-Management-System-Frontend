import { useCallback } from "react"
import { useRouter } from "next/navigation"
import useAuthStore from "@/store/authStore"

export function useAuth() {
  const router = useRouter()
  const {
    user,
    isAuthenticated,
    isLoading,
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
        if (result.role === "ADMIN") {
          router.push("/admin/dashboard")
        } else {
          router.push("/employee/dashboard")
        }
      }
      return result
    },
    [storeLogin, router]
  )

  const logout = useCallback(async () => {
    await storeLogout()
    router.push("/auth/login")
  }, [storeLogout, router])

  const requireAuth = useCallback(
    (requiredRole = null) => {
      if (!isAuthenticated) {
        router.push("/auth/login")
        return false
      }
      if (requiredRole && getRole() !== requiredRole) {
        router.push(getRole() === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard")
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
    login,
    logout,
    requireAuth,
    getRole,
    isAdmin,
    isEmployee,
    updateUser,
  }
}
