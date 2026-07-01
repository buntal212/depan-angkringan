<template>
  <q-page class="penjualan-page">
    <div class="penjualan-page__container">
      <!-- Header -->
      <div class="penjualan-page__header">
        <h1>Penjualan</h1>
        <p class="penjualan-page__date">{{ currentDate }}</p>
      </div>

      <!-- Search & Filter -->
      <div class="penjualan-page__toolbar">
        <div class="penjualan-page__search">
          <q-input
            v-model="searchQuery"
            placeholder="Cari menu..."
            dense
            outlined
            clearable
            class="penjualan-page__search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div class="penjualan-page__filters">
          <q-btn
            v-for="cat in categories"
            :key="cat.value"
            :label="cat.label"
            :color="activeCategory === cat.value ? 'primary' : 'grey-4'"
            :text-color="activeCategory === cat.value ? 'white' : 'dark'"
            dense
            unelevated
            class="penjualan-page__filter-btn"
            @click="activeCategory = cat.value"
          />
        </div>
      </div>

      <!-- Main Content -->
      <div class="penjualan-page__content">
        <!-- Menu Grid -->
        <div class="penjualan-page__menu-section">
          <div class="row q-gutter-md">
            <div v-for="item in filteredMenu" :key="item.id" class="col-12 col-sm-6 col-md-4">
              <MenuCard
                :menu-item="item"
                :quantity="getItemQuantity(item.id)"
                @add-to-cart="handleAddToCart"
                @increase="handleIncrease"
                @decrease="handleDecrease"
              />
            </div>
          </div>

          <div v-if="filteredMenu.length === 0" class="penjualan-page__empty">
            <p>Tidak ada menu yang ditemukan</p>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="penjualan-page__sidebar">
          <CartTable />
          <SummaryCard :is-processing="isProcessing" @open-payment="showPaymentDialog = true" />
        </div>
      </div>
    </div>

    <!-- Payment Dialog -->
    <PaymentDialog v-model="showPaymentDialog" @payment-success="handlePaymentSuccess" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// import { useQuasar } from 'quasar'
import { usePenjualanStore } from '../../stores/penjualanxxxx'
import MenuCard from '../../components/MenuCard.vue'
import CartTable from '../../components/CartTable.vue'
import SummaryCard from '../../components/SummaryCard.vue'
import PaymentDialog from '../../components/PaymentDialog.vue'

// const $q = useQuasar()
const penjualanStore = usePenjualanStore()

const searchQuery = ref('')
const activeCategory = ref('all')
const showPaymentDialog = ref(false)
const isProcessing = ref(false)

const categories = [
  { label: 'Semua', value: 'all' },
  { label: 'Makanan', value: 'makanan' },
  { label: 'Minuman', value: 'minuman' },
  { label: 'Snack', value: 'snack' },
]

const currentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const filteredMenu = computed(() => {
  let items = penjualanStore.menuItems

  if (activeCategory.value !== 'all') {
    items = items.filter((item) => item.category === activeCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter((item) => item.name.toLowerCase().includes(query))
  }

  return items
})

const getItemQuantity = (id) => {
  const cartItem = penjualanStore.cartItems.find((item) => item.id === id)
  return cartItem ? cartItem.quantity : 0
}

const handleAddToCart = (item) => {
  penjualanStore.addToCart(item)
}

const handleIncrease = (item) => {
  const existingQuantity = getItemQuantity(item.id)
  if (existingQuantity > 0) {
    penjualanStore.updateQuantity(item.id, existingQuantity + 1)
  } else {
    penjualanStore.addToCart(item)
  }
}

const handleDecrease = (item) => {
  const existingQuantity = getItemQuantity(item.id)
  if (existingQuantity > 1) {
    penjualanStore.updateQuantity(item.id, existingQuantity - 1)
  } else if (existingQuantity === 1) {
    penjualanStore.removeFromCart(item.id)
  }
}

// const handlePaymentSuccess = (orderData) => {
//   $q.notify({
//     type: 'positive',
//     message: 'Pembayaran berhasil!',
//     position: 'top-right'
//   })
// }

onMounted(() => {
  penjualanStore.fetchMenu()
})
</script>

<style scoped>
.penjualan-page {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.penjualan-page__container {
  max-width: 1400px;
  margin: 0 auto;
}

.penjualan-page__header {
  margin-bottom: 20px;
}

.penjualan-page__header h1 {
  margin: 0 0 4px 0;
  font-size: 28px;
  color: #333;
}

.penjualan-page__date {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.penjualan-page__toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.penjualan-page__search {
  max-width: 400px;
}

.penjualan-page__search-input {
  width: 100%;
}

.penjualan-page__filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.penjualan-page__filter-btn {
  border-radius: 20px;
  font-size: 13px;
  padding: 4px 16px;
}

.penjualan-page__content {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 20px;
  align-items: start;
}

.penjualan-page__menu-section {
  min-width: 0;
}

.penjualan-page__menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.penjualan-page__empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.penjualan-page__sidebar {
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 1024px) {
  .penjualan-page__content {
    grid-template-columns: 1fr;
  }

  .penjualan-page__sidebar {
    position: static;
  }
}

@media (max-width: 600px) {
  .penjualan-page__menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
}
</style>
