import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useMasterAngkringan = defineStore('master-angkringan-store', {
  state: () => ({
    items: [],
    loading: false,
    loadingaktif: null,
    done: false,
    page: 1,
    filterAngkringanId: null,
  }),
  actions: {
    async getItems(append = false) {
      if (this.loading || this.done) return

      this.loading = true
      const params = {
        page: this.page,
        angkringan_id: this.filterAngkringanId,
      }
      try {
        const res = await api.get('/master-angkringan', params)

        const payload = res.data.data ?? res.data
        const newItems = payload.data || []
        const currentPage = payload.current_page || 1
        const lastPage = payload.last_page || 1

        if (append) {
          this.items.push(...newItems)
        } else {
          this.items = newItems
        }

        if (currentPage >= lastPage || newItems.length === 0) {
          this.done = true
        } else {
          this.page++
        }
      } catch (err) {
        console.error('API ERROR:', err)
      } finally {
        this.loading = false
      }
    },
    resetData() {
      this.items = []
      this.page = 1
      this.done = false
    },

    async updateflaging(flaging, id) {
      if (this.loadingaktif === id) return

      this.loadingaktif = id
      const payload = {
        flaging: flaging,
        id: id,
      }
      try {
        const response = await api.post('/master-flagingstatus', payload)

        const updatedData = response.data

        const index = this.items.findIndex((item) => item.id === updatedData.id)

        if (index !== -1) {
          this.items[index] = {
            ...this.items[index],
            ...updatedData,
          }
        }

        return updatedData
      } catch (error) {
        console.error('API ERROR:', error)
        throw error
      } finally {
        this.loadingaktif = null
      }
    },
  },
})
