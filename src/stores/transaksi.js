import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useTransaksiStore = defineStore('transaksi-store', {
  state: () => ({
    cart: [],
    selectedTable: null,
    customerName: '',
    paymentMethod: '',
    isProcessing: false,
    lastTransaction: null,
    menus: [],
    angkringans: [],
    loading: false,
    error: null,
  }),

  getters: {
    // Hitung total harga dengan defensive programming
    total: (state) => {
      try {
        return state.cart.reduce((sum, item) => {
          const harga = Number(item?.harga || 0)
          const quantity = Number(item?.quantity || 0)
          return sum + (harga * quantity)
        }, 0)
      } catch (error) {
        console.error('Error calculating total:', error)
        return 0
      }
    },

    // Hitung total item dengan defensive programming
    totalItems: (state) => {
      try {
        return state.cart.reduce((sum, item) => {
          const quantity = Number(item?.quantity || 0)
          return sum + quantity
        }, 0)
      } catch (error) {
        console.error('Error calculating total items:', error)
        return 0
      }
    },

    // Check jika cart kosong
    isEmpty: (state) => {
      return !state.cart || state.cart.length === 0
    },

    // Get menu IDs in cart dengan validasi
    menuIdsInCart: (state) => {
      try {
        return state.cart
          ?.filter(item => item?.id)
          ?.map((item) => item.id) || []
      } catch (error) {
        console.error('Error getting menu IDs:', error)
        return []
      }
    },

    // Get all menus dengan fallback empty array
    allMenus: (state) => {
      return state.menus || []
    },

    // Get all angkringans dengan fallback empty array
    allAngkringans: (state) => {
      return state.angkringans || []
    },

    // Getter untuk mendapatkan formatted total
    formattedTotal: (state) => {
      try {
        return state.total.toLocaleString('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0
        })
      } catch (error) {
        console.error('Error formatting total:', error)
        return 'Rp 0'
      }
    },

    // Getter untuk mendapatkan loading state
    isLoading: (state) => {
      return state.isProcessing || state.loading
    },

    // Getter untuk mendapatkan error message
    errorMessage: (state) => {
      return state.error || null
    },
  },

  actions: {
    // Reset error state
    clearError() {
      this.error = null
    },

    // Set error state
    setError(message) {
      this.error = message
    },

    // Format number dengan titik (legacy method, gunakan formatters.js untuk penggunaan baru)
    formatNumber(num) {
      try {
        const value = Number(num || 0)
        return isNaN(value) ? '0' : value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      } catch (error) {
        console.error('Error formatting number:', error)
        return '0'
      }
    },

    // Tambah item ke keranjang dengan validasi
    addToCart(menu) {
      try {
        if (!menu || !menu.id) {
          console.error('Invalid menu item')
          return
        }

        const existingItem = this.cart.find((item) => item?.id === menu.id)

        if (existingItem) {
          existingItem.quantity = Number(existingItem.quantity || 0) + 1
        } else {
          this.cart.push({
            id: menu.id,
            nama: menu.nama || 'Unknown Item',
            harga: Number(menu.harga || 0),
            quantity: 1,
            image: menu.image || '/images/placeholder.jpg',
          })
        }
      } catch (error) {
        console.error('Error adding to cart:', error)
        this.setError('Failed to add item to cart')
      }
    },

    // Update quantity item dengan validasi
    updateQuantity(menuId, newQuantity) {
      try {
        if (!menuId || typeof menuId !== 'string') {
          console.error('Invalid menu ID')
          return
        }

        const quantity = Number(newQuantity)
        if (isNaN(quantity) || quantity < 1) {
          return
        }

        const item = this.cart.find((item) => item?.id === menuId)
        if (item) {
          item.quantity = quantity
        }
      } catch (error) {
        console.error('Error updating quantity:', error)
        this.setError('Failed to update quantity')
      }
    },

    // Hapus item dari keranjang dengan validasi
    removeFromCart(menuId) {
      try {
        if (!menuId || typeof menuId !== 'string') {
          console.error('Invalid menu ID')
          return
        }

        const index = this.cart.findIndex((item) => item?.id === menuId)
        if (index > -1) {
          this.cart.splice(index, 1)
        }
      } catch (error) {
        console.error('Error removing from cart:', error)
        this.setError('Failed to remove item from cart')
      }
    },

    // Clear keranjang
    clearCart() {
      try {
        this.cart = []
      } catch (error) {
        console.error('Error clearing cart:', error)
        this.setError('Failed to clear cart')
      }
    },

    // Set meja dengan validasi
    setTable(tableId) {
      try {
        if (tableId === undefined || tableId === null) {
          console.error('Invalid table ID')
          return
        }
        this.selectedTable = tableId
      } catch (error) {
        console.error('Error setting table:', error)
        this.setError('Failed to set table')
      }
    },

    // Set customer name dengan validasi
    setCustomerName(name) {
      try {
        if (name !== undefined && name !== null) {
          this.customerName = name
        } else {
          console.error('Invalid customer name')
        }
      } catch (error) {
        console.error('Error setting customer name:', error)
        this.setError('Failed to set customer name')
      }
    },

    // Set payment method dengan validasi
    setPaymentMethod(method) {
      try {
        if (method && typeof method === 'string') {
          this.paymentMethod = method
        } else {
          console.error('Invalid payment method')
        }
      } catch (error) {
        console.error('Error setting payment method:', error)
        this.setError('Failed to set payment method')
      }
    },

    // Reset transaksi dengan validasi
    resetTransaction() {
      try {
        this.clearCart()
        this.selectedTable = null
        this.customerName = ''
        this.paymentMethod = ''
        this.isProcessing = false
        this.setError(null) // Clear error when resetting
      } catch (error) {
        console.error('Error resetting transaction:', error)
        this.setError('Failed to reset transaction')
      }
    },

    // Simpan transaksi
    async saveTransaction() {
      if (this.isEmpty) {
        throw new Error('Keranjang tidak boleh kosong')
      }

      if (!this.selectedTable) {
        throw new Error('Silakan pilih meja terlebih dahulu')
      }

      if (!this.paymentMethod) {
        throw new Error('Silakan pilih metode pembayaran')
      }

      this.isProcessing = true

      try {
        const payload = {
          angkringan_id: this.selectedTable,
          customer_name: this.customerName || '-',
          payment_method: this.paymentMethod,
          items: this.cart.map((item) => ({
            menu_id: item.id,
            quantity: item.quantity,
            harga: item.harga,
          })),
          total: this.total,
        }

        const response = await api.post('/transaksi', payload)

        const transaction = {
          id: response.data.data.id,
          no_transaksi: response.data.data.no_transaksi,
          items: [...this.cart],
          total: this.total,
          table: this.selectedTable,
          customerName: this.customerName,
          paymentMethod: this.paymentMethod,
          timestamp: new Date().toISOString(),
        }

        this.lastTransaction = transaction

        return transaction
      } catch (error) {
        console.error('Error saving transaction:', error)
        if (error.response) {
          throw new Error(error.response.data.message || 'Gagal menyimpan transaksi')
        } else if (error.request) {
          throw new Error('Tidak dapat terhubung ke server')
        } else {
          throw error
        }
      } finally {
        this.isProcessing = false
      }
    },

    // Get receipt untuk struk
    getReceipt() {
      if (!this.lastTransaction) return null

      return {
        ...this.lastTransaction,
        formattedTotal: this.formatNumber(this.lastTransaction.total),
        items: this.lastTransaction.items.map((item) => ({
          ...item,
          subtotal: item.harga * item.quantity,
          formattedSubtotal: this.formatNumber(item.harga * item.quantity),
          formattedPrice: this.formatNumber(item.harga),
        })),
      }
    },

    // Load menus dari API
    async loadMenus() {
      try {
        const response = await api.get('/menus')
        this.menus = response.data.data
        return response.data.data
      } catch (error) {
        console.error('Error loading menus:', error)
        if (error.response) {
          throw new Error(error.response.data.message || 'Gagal memuat data menu')
        } else if (error.request) {
          throw new Error('Tidak dapat terhubung ke server')
        } else {
          throw error
        }
      }
    },

    // Load angkringans dari API
    async loadAngkringans() {
      try {
        const response = await api.get('/angkringans')
        this.angkringans = response.data.data
        return response.data.data
      } catch (error) {
        console.error('Error loading angkringans:', error)
        if (error.response) {
          throw new Error(error.response.data.message || 'Gagal memuat data angkringan')
        } else if (error.request) {
          throw new Error('Tidak dapat terhubung ke server')
        } else {
          throw error
        }
      }
    },

    // Load semua data yang dibutuhkan
    async loadData() {
      try {
        const [menus, angkringans] = await Promise.all([this.loadMenus(), this.loadAngkringans()])
        return { menus, angkringans }
      } catch (error) {
        console.error('Error loading data:', error)
        throw error
      }
    },
  },
})
