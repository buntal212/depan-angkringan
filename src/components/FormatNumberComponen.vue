<template>
  <q-input
    :model-value="displayValue"
    @update:model-value="onInput"
    @blur="onBlur"
    @focus="onFocus"
    :label="label"
    dark
    outlined
    rounded
    color="amber"
    bg-color="grey-10"
    dense
    :rules="rules"
    lazy-rules
    :prefix="prefix"
    inputmode="numeric"
  >
    <template v-if="icon" v-slot:prepend>
      <q-icon :name="icon" color="amber" />
    </template>
    <slot />
  </q-input>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  /** v-model value (number) */
  modelValue: {
    type: [Number, String],
    default: 0,
  },
  label: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  prefix: {
    type: String,
    default: '',
  },
  rules: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const isFocused = ref(false)

/**
 * Format number dengan titik sebagai pemisah ribuan (id-ID)
 */
const formatNumber = (val) => {
  if (val === null || val === undefined || val === '') return ''
  const num = Number(String(val).replace(/\./g, '').replace(/,/g, ''))
  if (isNaN(num)) return ''
  return num.toLocaleString('id-ID')
}

/**
 * Parse string yang terformat kembali ke number
 */
const parseNumber = (val) => {
  if (!val) return 0
  const cleaned = String(val).replace(/\./g, '').replace(/,/g, '')
  const num = Number(cleaned)
  return isNaN(num) ? 0 : num
}

const displayValue = computed(() => {
  if (isFocused.value) {
    // Saat fokus, tetap tampilkan format agar user bisa lihat angka jelas
    return formatNumber(props.modelValue)
  }
  return formatNumber(props.modelValue)
})

const onInput = (val) => {
  // Bersihkan format, ambil angka murni
  const num = parseNumber(val)
  emit('update:modelValue', num)
}

const onFocus = () => {
  isFocused.value = true
}

const onBlur = () => {
  isFocused.value = false
}
</script>
