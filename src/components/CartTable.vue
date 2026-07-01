<template>
  <div class="cart-table">
    <div class="cart-table__header">
      <h3>Keranjang</h3>
      <button v-if="cartItems.length > 0" class="cart-table__clear-btn" @click="handleClearCart">
        Hapus Semua
      </button>
    </div>

    <div v-if="cartItems.length === 0" class="cart-table__empty">
      <p>Keranjang kosong</p>
      <p class="cart-table__empty-hint">Pilih menu untuk menambahkan item</p>
    </div>

    <div v-else class="cart-table__items">
      <div v-for="item in cartItems" :key="item.id" class="cart-table__item">
        <div class="cart-table__item-info">
          <h4 class="cart-table__item-name">{{ item.name }}</h4>
          <p class="cart-table__item-price">Rp {{ formatPrice(item.price) }}</p>
        </div>

        <div class="cart-table__item-quantity">
          <button
            class="cart-table__qty-btn"
            @click="handleDecreaseQuantity(item)"
            :disabled="item.quantity <= 1"
          >
            -
          </button>
          <span class="cart-table__qty-value">{{ item.quantity }}</span>
          <button class="cart-table__qty-btn" @click="handleIncreaseQuantity(item)">+</button>
        </div>

        <div class="cart-table__item-subtotal">
          <p>Rp {{ formatPrice(item.price * item.quantity) }}</p>
        </div>

        <button class="cart-table__item-remove" @click="handleRemoveItem(item)">&times;</button>
      </div>
    </div>

    <div v-if="cartItems.length > 0" class="cart-table__total">
      <div class="cart-table__total-row">
        <span>Total Item:</span>
        <span>{{ totalItems }}</span>
      </div>
      <div class="cart-table__total-row cart-table__total-row--bold">
        <span>Total:</span>
        <span>Rp {{ formatPrice(totalAmount) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePenjualanStore } from '../stores/penjualanxxxx'

// const emit = defineEmits(['clear-cart'])

const penjualanStore = usePenjualanStore()

// Computed
const cartItems = computed(() => penjualanStore.cartItems)
const totalItems = computed(() => penjualanStore.totalItems)
const totalAmount = computed(() => penjualanStore.totalAmount)

// Methods
const formatPrice = (price) => {
  return price.toLocaleString('id-ID')
}

const handleIncreaseQuantity = (item) => {
  penjualanStore.updateQuantity(item.id, item.quantity + 1)
}

const handleDecreaseQuantity = (item) => {
  if (item.quantity > 1) {
    penjualanStore.updateQuantity(item.id, item.quantity - 1)
  }
}

const handleRemoveItem = (item) => {
  penjualanStore.removeFromCart(item.id)
}

const handleClearCart = () => {
  penjualanStore.clearCart()
}
</script>

<style scoped>
.cart-table {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cart-table__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.cart-table__header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.cart-table__clear-btn {
  background: none;
  border: 1px solid #ff5252;
  color: #ff5252;
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.cart-table__clear-btn:hover {
  background: #ff5252;
  color: white;
}

.cart-table__empty {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.cart-table__empty p {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.cart-table__empty-hint {
  font-size: 12px !important;
  color: #bbb !important;
}

.cart-table__items {
  max-height: 400px;
  overflow-y: auto;
}

.cart-table__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.cart-table__item:last-child {
  border-bottom: none;
}

.cart-table__item-info {
  flex: 1;
  min-width: 0;
}

.cart-table__item-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-table__item-price {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.cart-table__item-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-table__qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #333;
  transition: all 0.2s ease;
}

.cart-table__qty-btn:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #999;
}

.cart-table__qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.cart-table__qty-value {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
}

.cart-table__item-subtotal {
  min-width: 100px;
  text-align: right;
}

.cart-table__item-subtotal p {
  margin: 0;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.cart-table__item-remove {
  background: none;
  border: none;
  color: #ff5252;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.cart-table__item-remove:hover {
  background: #ffebee;
}

.cart-table__total {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid #eee;
}

.cart-table__total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.cart-table__total-row--bold {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 0;
}
</style>
