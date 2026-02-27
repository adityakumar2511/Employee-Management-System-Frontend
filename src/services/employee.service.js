import api from "@/lib/axios"

export const employeeService = {
  getAll: async (params = {}) => {
    const { data } = await api.get("/employees", { params })
    return data
  },

  getById: async (id) => {
    const { data } = await api.get(`/employees/${id}`)
    return data
  },

  create: async (payload) => {
    const { data } = await api.post("/employees", payload)
    return data
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/employees/${id}`, payload)
    return data
  },

  delete: async (id) => {
    const { data } = await api.delete(`/employees/${id}`)
    return data
  },

  resetPassword: async (id, payload) => {
    const { data } = await api.post(`/employees/${id}/reset-password`, payload)
    return data
  },

  sendCredentials: async (id) => {
    const { data } = await api.post(`/employees/${id}/send-credentials`)
    return data
  },

  bulkImport: async (formData) => {
    const { data } = await api.post("/employees/bulk-import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data
  },

  downloadTemplate: async () => {
    const response = await api.get("/employees/bulk-template", {
      responseType: "blob",
    })
    return response
  },

  uploadDocument: async (id, formData) => {
    const { data } = await api.post(`/employees/${id}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data
  },

  getDepartments: async () => {
    const { data } = await api.get("/employees/departments")
    return data
  },

  toggleStatus: async (id, status) => {
    const { data } = await api.patch(`/employees/${id}/status`, { status })
    return data
  },
}
