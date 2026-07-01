<template>
  <div v-if="modelValue" class="payment-dialog-overlay" @click.self="handleClose">
    <div class="payment-dialog">
      <div class="payment-dialog__header">
        <h2>Pembayaran</h2>
        <button class="payment-dialog__close" @click="handleClose">&times;</button>
      </div>

      <div class="payment-dialog__summary">
        <div class="payment-dialog__summary-row">
          <span>Total Item:</span>
          <span>{{ totalItems }}</span>
        </div>
        <div class="payment-dialog__summary-row payment-dialog__summary-row--bold">
          <span>Total Pembayaran:</span>
          <span>Rp {{ formatPrice(totalAmount) }}</span>
        </div>
      </div>

      <div class="payment-dialog__form">
        <div class="payment-dialog__form-group">
          <label for="payment-method">Metode Pembayaran:</label>
          <select id="payment-method" v-model="paymentMethod" class="payment-dialog__select">
            <option value="cash">Tunai</option>
            <option value="qris">QRIS</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        <div v-if="paymentMethod === 'cash'" class="payment-dialog__form-group">
          <label for="cash-amount">Jumlah Uang:</label>
          <input
            id="cash-amount"
            v-model="cashAmount"
            type="number"
            class="payment-dialog__input"
            placeholder="Masukkan jumlah uang"
            min="0"
          />
          <div v-if="changeAmount !== null" class="payment-dialog__change">
            <span>Kembalian:</span>
            <span class="payment-dialog__change-amount"> Rp {{ formatPrice(changeAmount) }} </span>
          </div>
          <p v-if="cashAmountError" class="payment-dialog__error">
            {{ cashAmountError }}
          </p>
        </div>

        <div class="payment-dialog__form-group">
          <label for="customer-name">Nama Pelanggan (Opsional):</label>
          <input
            id="customer-name"
            v-model="customerName"
            type="text"
            class="payment-dialog__input"
            placeholder="Masukkan nama pelanggan"
          />
        </div>

        <div class="payment-dialog__form-group">
          <label for="notes">Catatan (Opsional):</label>
          <textarea
            id="notes"
            v-model="notes"
            class="payment-dialog__textarea"
            placeholder="Tambahkan catatan..."
            rows="3"
          ></textarea>
        </div>
      </div>

      <div class="payment-dialog__actions">
        <button class="payment-dialog__btn payment-dialog__btn--cancel" @click="handleClose">
          Batal
        </button>
        <button
          class="payment-dialog__btn payment-dialog__btn--confirm"
          @click="handleConfirm"
          :disabled="!canConfirm || isProcessing"
        >
          {{ isProcessing ? 'Memproses...' : 'Konfirmasi Pembayaran' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePenjualanStore } from '../stores/penjualanxxxx'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'payment-success'])

const penjualanStore = usePenjualanStore()

const paymentMethod = ref('cash')
const cashAmount = ref('')
const customerName = ref('')
const notes = ref('')
const isProcessing = ref(false)

// Computed
const totalItems = computed(() => penjualanStore.totalItems)
const totalAmount = computed(() => penjualanStore.totalAmount)

const changeAmount = computed(() => {
  if (paymentMethod.value !== 'cash' || !cashAmount.value) return null
  const amount = Number(cashAmount.value)
  return amount - totalAmount.value
})

const cashAmountError = computed(() => {
  if (paymentMethod.value !== 'cash' || !cashAmount.value) return null
  const amount = Number(cashAmount.value)
  if (amount < totalAmount.value) {
    return 'Jumlah uang kurang dari total pembayaran'
  }
  return null
})

const canConfirm = computed(() => {
  if (paymentMethod.value === 'cash') {
    return cashAmount.value && Number(cashAmount.value) >= totalAmount.value
  }
  return true
})

// Watchers
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      resetForm()
    }
  },
)

// Methods
const resetForm = () => {
  paymentMethod.value = 'cash'
  cashAmount.value = ''
  customerName.value = ''
  notes.value = ''
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleConfirm = async () => {
  if (!canConfirm.value || isProcessing.value) return

  isProcessing.value = true

  try {
    const orderData = {
      items: penjualanStore.cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      totalItems: totalItems.value,
      totalAmount: totalAmount.value,
      paymentMethod: paymentMethod.value,
      cashAmount: paymentMethod.value === 'cash' ? Number(cashAmount.value) : null,
      changeAmount: changeAmount.value,
      customerName: customerName.value || null,
      notes: notes.value || null,
    }

    await penjualanStore.processOrder(orderData)
    emit('payment-success', orderData)
    handleClose()
  } catch (error) {
    console.error('Payment error:', error)
  } finally {
    isProcessing.value = false
  }
}

const formatPrice = (price) => {
  return price.toLocaleString('id-ID')
}
</script>

<style scoped>
.payment-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.payment-dialog {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.payment-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.payment-dialog__header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.payment-dialog__close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.payment-dialog__close:hover {
  background: #f5f5f5;
  color: #333;
}

.payment-dialog__summary {
  padding: 20px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.payment-dialog__summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.payment-dialog__summary-row--bold {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 0;
}

.payment-dialog__form {
  padding: 20px 24px;
}

.payment-dialog__form-group {
  margin-bottom: 16px;
}

.payment-dialog__form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.payment-dialog__select,
.payment-dialog__input,
.payment-dialog__textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.payment-dialog__select:focus,
.payment-dialog__input:focus,
.payment-dialog__textarea:focus {
  outline: none;
  border-color: #4caf50;
}

.payment-dialog__textarea {
  resize: vertical;
  font-family: inherit;
}

.payment-dialog__change {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding: 8px 12px;
  background: #e8f5e9;
  border-radius: 6px;
  font-size: 14px;
}

.payment-dialog__change-amount {
  font-weight: bold;
  color: #2e7d32;
}

.payment-dialog__error {
  margin: 6px 0 0 0;
  color: #ff5252;
  font-size: 12px;
}

.payment-dialog__actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #eee;
}

.payment-dialog__btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.payment-dialog__btn--cancel {
  background: #f5f5f5;
  color: #666;
}

.payment-dialog__btn--cancel:hover {
  background: #e0e0e0;
}

.payment-dialog__btn--confirm {
  background: #4caf50;
  color: white;
}

.payment-dialog__btn--confirm:hover:not(:disabled) {
  background: #388e3c;
}

.payment-dialog__btn--confirm:disabled {
  background: #a5d6a7;
  cursor: not-allowed;
}
</style>
