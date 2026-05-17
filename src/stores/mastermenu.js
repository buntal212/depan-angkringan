import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useMasterMenu = defineStore('master-menu-store', {
  state: () => ({
    items: [],
    loading: false,
    done: false,

    paramsangkringan: {
      page: 1,
      per_page: 3,
      filterAngkringanId: '',
    },
  }),

  actions: {
    async getItems() {
      // cegah double request
      if (this.loading || this.done) return

      this.loading = true

      try {
        const res = await api.get('/master-menu', this.paramsangkringan)

        const rows = res?.data?.data || []

        // jika kosong
        if (rows.length === 0) {
          this.done = true
          return
        }

        // append tanpa duplicate
        const existingIds = new Set(this.items.map((i) => i.kodemenu))

        const newRows = rows.filter((i) => !existingIds.has(i.kodemenu))

        this.items.push(...newRows)

        // pagination
        if (res?.data?.next_page_url) {
          this.paramsangkringan.page++
        } else {
          this.done = true
        }
      } catch (err) {
        console.error('GET ITEMS ERROR:', err)
      } finally {
        this.loading = false
      }
    },

    resetData() {
      this.items = []
      this.done = false

      this.paramsangkringan.page = 1
    },

    async addItem(payload) {
      const res = await api.post('/master-menu', payload)

      const response = res?.data || {}
      const rows = response.data?.data || []
      const newItem = rows[0] || response.data

      if (!newItem) return null

      const index = this.items.findIndex((x) => x.kodemenu === newItem.kodemenu)

      if (index !== -1) {
        this.items.splice(index, 1, {
          ...this.items[index],
          ...newItem,
        })
      } else {
        this.items.unshift({
          ...newItem,
          _isNew: true,
        })
      }

      return newItem
    },

    async updateItem(kodemenu, payload) {
      const res = await api.put(`/master-menu/${kodemenu}`, payload)

      const updated = res?.data?.data

      if (!updated) return null

      const idx = this.items.findIndex((i) => i.kodemenu === kodemenu)

      if (idx !== -1) {
        this.items.splice(idx, 1, {
          ...this.items[idx],
          ...updated,
        })
      }

      return updated
    },

    async deleteItem(kodemenu) {
      await api.delete(`/master-menu/${kodemenu}`)

      this.items = this.items.filter((i) => i.kodemenu !== kodemenu)
    },
  },
})
