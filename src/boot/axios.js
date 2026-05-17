import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8197/api',
})

// Override get agar bisa tulis api.get(url, params) langsung
const originalGet = api.get.bind(api)
api.get = (url, params = {}) => originalGet(url, { params })

export default boot(({ app }) => {
  // 🔥 AUTO SET TOKEN SETIAP REQUEST
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
