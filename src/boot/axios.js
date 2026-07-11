import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// Override get agar bisa tulis api.get(url, params) langsung
const originalGet = api.get.bind(api)
api.get = (url, paramsOrConfig = {}) =>
  Object.prototype.hasOwnProperty.call(paramsOrConfig, 'params')
    ? originalGet(url, paramsOrConfig)
    : originalGet(url, { params: paramsOrConfig })

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
