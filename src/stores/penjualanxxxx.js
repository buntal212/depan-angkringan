import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePenjualanStorezzzzzzzzz = defineStore('penjualanzzzzzzz', () => {
  // State
  const cartItems = ref([])
  const searchTerm = ref('')
  const selectedCategory = ref('all')
  const loading = ref(false)
  const isPaymentDialogOpen = ref(false)
  const customerName = ref('')
  const customerPhone = ref('')
  const paymentMethod = ref('cash')
  const cashAmount = ref(0)
  const discount = ref(0)
  const taxRate = ref(0.1) // 10% pajak

  // Dummy menu data
  const menuItems = ref([
    {
      id: 1,
      name: 'Nasi Goreng',
      category: 'makanan',
      price: 15000,
      image: '/images/nasi-goreng.jpg',
      inStock: true,
    },
    {
      id: 2,
      name: 'Mie Goreng',
      category: 'makanan',
      price: 12000,
      image: '/images/mie-goreng.jpg',
      inStock: true,
    },
    {
      id: 3,
      name: 'Sate Ayam',
      category: 'makanan',
      price: 20000,
      image: '/images/sate-ayam.jpg',
      inStock: true,
    },
    {
      id: 4,
      name: 'Es Teh',
      category: 'minuman',
      price: 5000,
      image: '/images/es-teh.jpg',
      inStock: true,
    },
    {
      id: 5,
      name: 'Es Jeruk',
      category: 'minuman',
      price: 7000,
      image: '/images/es-jeruk.jpg',
      inStock: true,
    },
    {
      id: 6,
      name: 'Kopi Hitam',
      category: 'minuman',
      price: 8000,
      image: '/images/kopi-hitam.jpg',
      inStock: true,
    },
    {
      id: 7,
      name: 'Gorengan',
      category: 'snack',
      price: 3000,
      image: '/images/gorengan.jpg',
      inStock: true,
    },
    {
      id: 8,
      name: 'Sosis Bakar',
      category: 'snack',
      price: 10000,
      image: '/images/sosis-bakar.jpg',
      inStock: true,
    },
    {
      id: 9,
      name: 'Pisang Goreng',
      category: 'snack',
      price: 8000,
      image: '/images/pisang-goreng.jpg',
      inStock: true,
    },
  ])

  // Computed
  const categories = computed(() => {
    const cats = menuItems.value.map((item) => item.category)
    return ['all', ...new Set(cats)]
  })

  const filteredMenuItems = computed(() => {
    return menuItems.value.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.value.toLowerCase())
      const matchesCategory =
        selectedCategory.value === 'all' || item.category === selectedCategory.value
      return matchesSearch && matchesCategory
    })
  })

  const subtotal = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const taxAmount = computed(() => {
    return subtotal.value * taxRate.value
  })

  const totalAfterDiscount = computed(() => {
    return subtotal.value - discount.value
  })

  const grandTotal = computed(() => {
    return totalAfterDiscount.value + taxAmount.value
  })

  const change = computed(() => {
    return cashAmount.value > grandTotal.value ? cashAmount.value - grandTotal.value : 0
  })

  const cartItemCount = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  // Actions
  const addToCart = (menuItem) => {
    const existingItem = cartItems.value.find((item) => item.id === menuItem.id)

    if (existingItem) {
      existingItem.quantity++
    } else {
      cartItems.value.push({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        notes: '',
      })
    }
  }

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
    } else {
      const item = cartItems.value.find((item) => item.id === itemId)
      if (item) {
        item.quantity = newQuantity
      }
    }
  }

  const updateNotes = (itemId, notes) => {
    const item = cartItems.value.find((item) => item.id === itemId)
    if (item) {
      item.notes = notes
    }
  }

  const removeFromCart = (itemId) => {
    const index = cartItems.value.findIndex((item) => item.id === itemId)
    if (index > -1) {
      cartItems.value.splice(index, 1)
    }
  }

  const clearCart = () => {
    cartItems.value = []
  }

  const setDiscount = (amount) => {
    discount.value = parseFloat(amount) || 0
  }

  const setCashAmount = (amount) => {
    cashAmount.value = parseFloat(amount) || 0
  }

  const openPaymentDialog = () => {
    isPaymentDialogOpen.value = true
  }

  const closePaymentDialog = () => {
    isPaymentDialogOpen.value = false
    cashAmount.value = 0
  }

  const resetTransaction = () => {
    clearCart()
    customerName.value = ''
    customerPhone.value = ''
    paymentMethod.value = 'cash'
    discount.value = 0
    cashAmount.value = 0
  }

  return {
    // State
    cartItems,
    menuItems,
    searchTerm,
    selectedCategory,
    loading,
    isPaymentDialogOpen,
    customerName,
    customerPhone,
    paymentMethod,
    cashAmount,
    discount,
    taxRate,

    // Computed
    categories,
    filteredMenuItems,
    subtotal,
    taxAmount,
    totalAfterDiscount,
    grandTotal,
    change,
    cartItemCount,

    // Actions
    addToCart,
    updateQuantity,
    updateNotes,
    removeFromCart,
    clearCart,
    setDiscount,
    setCashAmount,
    openPaymentDialog,
    closePaymentDialog,
    resetTransaction,
  }
})
