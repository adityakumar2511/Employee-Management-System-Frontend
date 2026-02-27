import api from "@/lib/axios"

export const settingsService = {
  getCompany: async () => {
    const { data } = await api.get("/settings/company")
    return data
  },

  updateCompany: async (payload) => {
    const { data } = await api.put("/settings/company", payload)
    return data
  },

  uploadLogo: async (formData) => {
    const { data } = await api.post("/settings/company/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data
  },

  getGeoSettings: async () => {
    const { data } = await api.get("/settings/geo")
    return data
  },

  updateGeoSettings: async (payload) => {
    const { data } = await api.put("/settings/geo", payload)
    return data
  },

  getGeoLocations: async () => {
    const { data } = await api.get("/settings/geo/locations")
    return data
  },

  addGeoLocation: async (payload) => {
    const { data } = await api.post("/settings/geo/locations", payload)
    return data
  },

  updateGeoLocation: async (id, payload) => {
    const { data } = await api.put(`/settings/geo/locations/${id}`, payload)
    return data
  },

  deleteGeoLocation: async (id) => {
    const { data } = await api.delete(`/settings/geo/locations/${id}`)
    return data
  },

  getHolidayList: async (year) => {
    const { data } = await api.get("/settings/holidays", { params: { year } })
    return data
  },

  addHoliday: async (payload) => {
    const { data } = await api.post("/settings/holidays", payload)
    return data
  },

  deleteHoliday: async (id) => {
    const { data } = await api.delete(`/settings/holidays/${id}`)
    return data
  },
}
