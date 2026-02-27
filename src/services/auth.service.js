import api from "@/lib/axios"

export const authService = {
  login: async (credentials) => {
    const { data } = await api.post("/auth/login", credentials)
    return data
  },

  logout: async () => {
    const { data } = await api.post("/auth/logout")
    return data
  },

  refreshToken: async (refreshToken) => {
    const { data } = await api.post("/auth/refresh", { refreshToken })
    return data
  },

  forgotPassword: async (email) => {
    const { data } = await api.post("/auth/forgot-password", { email })
    return data
  },

  verifyOTP: async (payload) => {
    const { data } = await api.post("/auth/verify-otp", payload)
    return data
  },

  resetPassword: async (payload) => {
    const { data } = await api.post("/auth/reset-password", payload)
    return data
  },

  changePassword: async (payload) => {
    const { data } = await api.put("/auth/change-password", payload)
    return data
  },

  getMe: async () => {
    const { data } = await api.get("/auth/me")
    return data
  },

  updateFCMToken: async (fcmToken) => {
    const { data } = await api.put("/auth/fcm-token", { fcmToken })
    return data
  },
}
