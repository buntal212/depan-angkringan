import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach((to) => {
    const token = localStorage.getItem('auth_token')
    const expiresAt = localStorage.getItem('token_expires_at')

    const publicPages = ['/login', '/register']
    const isPublic = publicPages.includes(to.path)

    // Cek apakah token sudah expired
    const isExpired = expiresAt && new Date().getTime() >= new Date(expiresAt).getTime()

    // Token expired → hapus semua data login
    if (token && isExpired) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('token_expires_at')
      localStorage.removeItem('user_data')

      return '/login'
    }

    // Belum login → paksa ke login
    if (!isPublic && !token) {
      return '/login'
    }

    // Sudah login tetapi membuka login/register
    if (isPublic && token && !isExpired) {
      return '/'
    }

    // Lanjutkan normal
    return true
  })

  return Router
})
