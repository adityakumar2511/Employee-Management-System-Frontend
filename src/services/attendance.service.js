import api from "@/lib/axios"

export const attendanceService = {
  checkIn: async (payload) => {
    const { data } = await api.post("/attendance/check-in", payload)
    return data
  },

  checkOut: async (payload) => {
    const { data } = await api.post("/attendance/check-out", payload)
    return data
  },

  getTodayStatus: async () => {
    const { data } = await api.get("/attendance/today")
    return data
  },

  getMyAttendance: async (params = {}) => {
    const { data } = await api.get("/attendance/my", { params })
    return data
  },

  getAllAttendance: async (params = {}) => {
    const { data } = await api.get("/attendance", { params })
    return data
  },

  getEmployeeAttendance: async (employeeId, params = {}) => {
    const { data } = await api.get(`/attendance/employee/${employeeId}`, { params })
    return data
  },

  manualOverride: async (payload) => {
    const { data } = await api.post("/attendance/override", payload)
    return data
  },

  getMonthlyReport: async (params = {}) => {
    const { data } = await api.get("/attendance/monthly-report", { params })
    return data
  },

  getOutOfRangeLogs: async (params = {}) => {
    const { data } = await api.get("/attendance/out-of-range-logs", { params })
    return data
  },

  requestWFH: async (payload) => {
    const { data } = await api.post("/attendance/wfh-request", payload)
    return data
  },

  approveWFH: async (id, action) => {
    const { data } = await api.patch(`/attendance/wfh-request/${id}`, { action })
    return data
  },
}
