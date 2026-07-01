<template>
  <div
    class="menu-card"
    :class="{ 'menu-card--selected': isInCart, 'menu-card--out-of-stock': !menuItem.inStock }"
    @click="handleAddToCart"
  >
    <div class="menu-card__image">
      <img :src="menuItem.image" :alt="menuItem.name" @error="handleImageError" />
      <div v-if="isInCart" class="menu-card__quantity">
        {{ cartQuantity }}
      </div>
      <div v-if="!menuItem.inStock" class="menu-card__out-of-stock-badge">Habis</div>
    </div>

    <div class="menu-card__content">
      <h3 class="menu-card__name">{{ menuItem.name }}</h3>
      <p class="menu-card__price">Rp {{ formatPrice(menuItem.price) }}</p>
      <p class="menu-card__category">{{ menuItem.category }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePenjualanStore } from '../stores/penjualanxxxx'

const props = defineProps({
  menuItem: {
    type: Object,
    required: true,
    validator: (value) => {
      return (
        typeof value.id === 'number' &&
        typeof value.name === 'string' &&
        typeof value.price === 'number' &&
        typeof value.category === 'string' &&
        typeof value.inStock === 'boolean'
      )
    },
  },
})

const emit = defineEmits(['add-to-cart'])

const penjualanStore = usePenjualanStore()

// Computed
const isInCart = computed(() => {
  return penjualanStore.cartItems.some((item) => item.id === props.menuItem.id)
})

const cartQuantity = computed(() => {
  const cartItem = penjualanStore.cartItems.find((item) => item.id === props.menuItem.id)
  return cartItem ? cartItem.quantity : 0
})

// Methods
const handleAddToCart = () => {
  if (!props.menuItem.inStock) return
  emit('add-to-cart', props.menuItem)
}

const formatPrice = (price) => {
  return price?.toLocaleString('id-ID') || '0'
}

const handleImageError = (event) => {
  event.target.src = '/images/no-image.svg'
}
</script>

<style scoped>
.menu-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.menu-card--selected {
  border-color: #4caf50;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
}

.menu-card--out-of-stock {
  opacity: 0.6;
  cursor: not-allowed;
}

.menu-card--out-of-stock:hover {
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.menu-card__image {
  position: relative;
  width: 100%;
  height: 150px;
  overflow: hidden;
}

.menu-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.menu-card:hover .menu-card__image img {
  transform: scale(1.05);
}

.menu-card__quantity {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #4caf50;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  z-index: 1;
}

.menu-card__out-of-stock-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  z-index: 1;
}

.menu-card__content {
  padding: 12px;
}

.menu-card__name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-card__price {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: bold;
  color: #2196f3;
}

.menu-card__category {
  margin: 0;
  font-size: 12px;
  color: #666;
  text-transform: capitalize;
}
</style>
