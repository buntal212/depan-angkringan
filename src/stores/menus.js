import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useMenuStore = defineStore('menu-store', {
  state: () => ({
    menus: [],
    loading: false,
    done: false
  }),
  actions: {
    async getMenus() {
      if (this.loading || this.done) return

      this.loading = true
      try {
        const res = await api.get('/menus')
        const data = res.data.data ?? res.data
        this.menus = data
      } catch (err) {
        console.error('API ERROR:', err)
      } finally {
        this.loading = false
      }
    }
  }
})
