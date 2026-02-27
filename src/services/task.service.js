import api from "@/lib/axios"

export const taskService = {
  create: async (payload) => {
    const { data } = await api.post("/tasks", payload)
    return data
  },

  getAll: async (params = {}) => {
    const { data } = await api.get("/tasks", { params })
    return data
  },

  getMyTasks: async (params = {}) => {
    const { data } = await api.get("/tasks/my", { params })
    return data
  },

  getById: async (id) => {
    const { data } = await api.get(`/tasks/${id}`)
    return data
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/tasks/${id}`, payload)
    return data
  },

  updateProgress: async (id, payload) => {
    const { data } = await api.patch(`/tasks/${id}/progress`, payload)
    return data
  },

  delete: async (id) => {
    const { data } = await api.delete(`/tasks/${id}`)
    return data
  },

  addComment: async (id, comment) => {
    const { data } = await api.post(`/tasks/${id}/comments`, { comment })
    return data
  },

  getCompletionReport: async (params = {}) => {
    const { data } = await api.get("/tasks/completion-report", { params })
    return data
  },
}
