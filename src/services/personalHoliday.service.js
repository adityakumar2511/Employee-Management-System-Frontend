import api from "@/lib/axios"

export const personalHolidayService = {
  apply: async (payload) => {
    const { data } = await api.post("/personal-holidays", payload)
    return data
  },

  getMyHolidays: async (params = {}) => {
    const { data } = await api.get("/personal-holidays/my", { params })
    return data
  },

  getAllHolidays: async (params = {}) => {
    const { data } = await api.get("/personal-holidays", { params })
    return data
  },

  getBalance: async () => {
    const { data } = await api.get("/personal-holidays/balance")
    return data
  },

  getEmployeeBalance: async (employeeId) => {
    const { data } = await api.get(`/personal-holidays/balance/${employeeId}`)
    return data
  },

  approve: async (id, comment) => {
    const { data } = await api.patch(`/personal-holidays/${id}/approve`, { comment })
    return data
  },

  reject: async (id, comment) => {
    const { data } = await api.patch(`/personal-holidays/${id}/reject`, { comment })
    return data
  },

  setQuota: async (employeeId, quota) => {
    const { data } = await api.post(`/personal-holidays/quota/${employeeId}`, { quota })
    return data
  },

  setBulkQuota: async (payload) => {
    const { data } = await api.post("/personal-holidays/quota/bulk", payload)
    return data
  },

  yearEnd: async (action) => {
    const { data } = await api.post("/personal-holidays/year-end", { action })
    return data
  },
}
