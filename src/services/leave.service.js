import api from "@/lib/axios"

export const leaveService = {
  apply: async (payload) => {
    const { data } = await api.post("/leaves", payload)
    return data
  },

  getMyLeaves: async (params = {}) => {
    const { data } = await api.get("/leaves/my", { params })
    return data
  },

  getAllLeaves: async (params = {}) => {
    const { data } = await api.get("/leaves", { params })
    return data
  },

  getBalance: async () => {
    const { data } = await api.get("/leaves/balance")
    return data
  },

  getEmployeeBalance: async (employeeId) => {
    const { data } = await api.get(`/leaves/balance/${employeeId}`)
    return data
  },

  approve: async (id, comment) => {
    const { data } = await api.patch(`/leaves/${id}/approve`, { comment })
    return data
  },

  reject: async (id, comment) => {
    const { data } = await api.patch(`/leaves/${id}/reject`, { comment })
    return data
  },

  cancel: async (id) => {
    const { data } = await api.delete(`/leaves/${id}`)
    return data
  },

  getLeaveTypes: async () => {
    const { data } = await api.get("/leaves/types")
    return data
  },

  createLeaveType: async (payload) => {
    const { data } = await api.post("/leaves/types", payload)
    return data
  },

  updateLeaveType: async (id, payload) => {
    const { data } = await api.put(`/leaves/types/${id}`, payload)
    return data
  },

  yearEndCarryForward: async (payload) => {
    const { data } = await api.post("/leaves/year-end", payload)
    return data
  },
}
