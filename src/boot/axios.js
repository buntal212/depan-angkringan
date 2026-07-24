import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { clearAuthSession } from 'src/utils/authSession'

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

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && localStorage.getItem('auth_token')) {
        clearAuthSession()
        console.info('[Auth Session]', 'Logout otomatis: sesi ditolak oleh server.')
        window.location.replace('/login')
      }

      return Promise.reject(error)
    },
  )

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
