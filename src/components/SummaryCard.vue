<template>
  <div class="summary-card">
    <div class="summary-card__header">
      <h3>Ringkasan</h3>
    </div>

    <div class="summary-card__body">
      <div class="summary-card__stat">
        <span class="summary-card__stat-label">Total Item</span>
        <span class="summary-card__stat-value">{{ totalItems }}</span>
      </div>

      <div class="summary-card__stat">
        <span class="summary-card__stat-label">Total Harga</span>
        <span class="summary-card__stat-value summary-card__stat-value--price">
          Rp {{ formatPrice(totalAmount) }}
        </span>
      </div>

      <div class="summary-card__stat">
        <span class="summary-card__stat-label">Jumlah Menu</span>
        <span class="summary-card__stat-value">{{ uniqueItems }}</span>
      </div>
    </div>

    <div class="summary-card__actions">
      <button
        class="summary-card__btn summary-card__btn--pay"
        :disabled="totalItems === 0 || isProcessing"
        @click="$emit('open-payment')"
      >
        <span v-if="isProcessing">Memproses...</span>
        <span v-else>Bayar Sekarang</span>
      </button>

      <button
        class="summary-card__btn summary-card__btn--clear"
        :disabled="totalItems === 0"
        @click="handleClearCart"
      >
        Hapus Semua
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePenjualanStore } from '../stores/penjualanxxxx'

defineProps({
  isProcessing: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['open-payment'])

const penjualanStore = usePenjualanStore()

const totalItems = computed(() => penjualanStore.totalItems)
const totalAmount = computed(() => penjualanStore.totalAmount)
const uniqueItems = computed(() => penjualanStore.cartItems.length)

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(price || 0)
}

const handleClearCart = () => {
  if (confirm('Hapus semua item dari keranjang?')) {
    penjualanStore.clearCart()
  }
}
</script>

<style scoped>
.summary-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-card__header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.summary-card__header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.summary-card__body {
  margin-bottom: 20px;
}

.summary-card__stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.summary-card__stat:last-child {
  border-bottom: none;
}

.summary-card__stat-label {
  font-size: 14px;
  color: #666;
}

.summary-card__stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.summary-card__stat-value--price {
  font-size: 20px;
  color: #4caf50;
}

.summary-card__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-card__btn {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.summary-card__btn--pay {
  background: #4caf50;
  color: white;
}

.summary-card__btn--pay:hover:not(:disabled) {
  background: #388e3c;
}

.summary-card__btn--clear {
  background: #f5f5f5;
  color: #666;
}

.summary-card__btn--clear:hover:not(:disabled) {
  background: #e0e0e0;
}

.summary-card__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
