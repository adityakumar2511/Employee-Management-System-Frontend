import api from "@/lib/axios"

export const payrollService = {
  // Salary Structure
  getStructure: async (employeeId) => {
    const { data } = await api.get(`/payroll/structure/${employeeId}`)
    return data
  },

  saveStructure: async (employeeId, payload) => {
    const { data } = await api.post(`/payroll/structure/${employeeId}`, payload)
    return data
  },

  addComponent: async (employeeId, payload) => {
    const { data } = await api.post(`/payroll/structure/${employeeId}/component`, payload)
    return data
  },

  updateComponent: async (employeeId, componentId, payload) => {
    const { data } = await api.put(`/payroll/structure/${employeeId}/component/${componentId}`, payload)
    return data
  },

  deleteComponent: async (employeeId, componentId) => {
    const { data } = await api.delete(`/payroll/structure/${employeeId}/component/${componentId}`)
    return data
  },

  // Templates
  getTemplates: async () => {
    const { data } = await api.get("/payroll/templates")
    return data
  },

  saveTemplate: async (payload) => {
    const { data } = await api.post("/payroll/templates", payload)
    return data
  },

  applyTemplate: async (templateId, employeeIds) => {
    const { data } = await api.post(`/payroll/templates/${templateId}/apply`, { employeeIds })
    return data
  },

  // Payroll generation
  generate: async (payload) => {
    const { data } = await api.post("/payroll/generate", payload)
    return data
  },

  getPayrollList: async (params = {}) => {
    const { data } = await api.get("/payroll", { params })
    return data
  },

  getPayrollDetail: async (payrollId) => {
    const { data } = await api.get(`/payroll/${payrollId}`)
    return data
  },

  overrideSalary: async (payrollId, payload) => {
    const { data } = await api.patch(`/payroll/${payrollId}/override`, payload)
    return data
  },

  markPaid: async (payrollId) => {
    const { data } = await api.patch(`/payroll/${payrollId}/mark-paid`)
    return data
  },

  bulkMarkPaid: async (payrollIds) => {
    const { data } = await api.post("/payroll/bulk-mark-paid", { payrollIds })
    return data
  },

  // Salary slips
  getMySalarySlips: async (params = {}) => {
    const { data } = await api.get("/payroll/my-slips", { params })
    return data
  },

  downloadSlip: async (payrollId) => {
    const response = await api.get(`/payroll/${payrollId}/slip/download`, {
      responseType: "blob",
    })
    return response
  },

  bulkDownloadSlips: async (params = {}) => {
    const response = await api.get("/payroll/slips/bulk-download", {
      params,
      responseType: "blob",
    })
    return response
  },

  getBankExport: async (params = {}) => {
    const response = await api.get("/payroll/bank-export", {
      params,
      responseType: "blob",
    })
    return response
  },
}
