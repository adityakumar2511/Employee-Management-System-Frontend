import api from "@/lib/axios"

export const reportService = {
  getAttendanceReport: async (params = {}) => {
    const { data } = await api.get("/reports/attendance", { params })
    return data
  },

  getLeaveReport: async (params = {}) => {
    const { data } = await api.get("/reports/leave", { params })
    return data
  },

  getPayrollReport: async (params = {}) => {
    const { data } = await api.get("/reports/payroll", { params })
    return data
  },

  getLOPReport: async (params = {}) => {
    const { data } = await api.get("/reports/lop", { params })
    return data
  },

  getPersonalHolidayReport: async (params = {}) => {
    const { data } = await api.get("/reports/personal-holidays", { params })
    return data
  },

  getTaskReport: async (params = {}) => {
    const { data } = await api.get("/reports/tasks", { params })
    return data
  },

  exportReport: async (type, params = {}) => {
    const response = await api.get(`/reports/${type}/export`, {
      params,
      responseType: "blob",
    })
    return response
  },

  getDashboardStats: async () => {
    const { data } = await api.get("/reports/dashboard-stats")
    return data
  },
}
