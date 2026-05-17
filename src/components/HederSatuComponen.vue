<template>
  <div class="row items-center q-mb-lg animate-fade-in">
    <q-btn flat round color="amber" icon="arrow_back" @click="onBack" class="q-mr-sm" />

    <div>
      <div class="text-h5 text-amber text-weight-bolder">
        {{ title }}
      </div>

      <div class="text-caption text-grey-5">
        {{ subtitle }}
      </div>
    </div>

    <q-space />

    <div class="header-actions row items-center justify-end q-gutter-sm">
      <q-btn
        v-if="showAddButton"
        unelevated
        rounded
        color="amber"
        text-color="black"
        icon="add"
        label="Tambah"
        class="text-weight-bold"
        @click="$emit('add')"
      />

      <q-btn
        unelevated
        rounded
        color="amber"
        text-color="black"
        icon="refresh"
        label="Refresh"
        class="text-weight-bold"
        @click="$emit('refresh')"
      />

      <!-- slot masuk sini -->
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  /** Judul halaman */
  title: {
    type: String,
    required: true,
  },
  /** Sub-judul / deskripsi */
  subtitle: {
    type: String,
    default: '',
  },
  /** Tampilkan tombol tambah (default: true) */
  showAddButton: {
    type: Boolean,
    default: true,
  },
  /** Route tujuan tombol back (default: '/') */
  backRoute: {
    type: String,
    default: '/',
  },
})

defineEmits(['add', 'refresh'])

const router = useRouter()

const onBack = () => {
  router.push(props.backRoute)
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.header-actions {
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 600px) {
  .header-actions {
    width: 100%;
    margin-top: 12px;
    justify-content: flex-start;
  }

  .header-actions .q-btn {
    flex: 1;
    min-width: 120px;
  }
}
</style>
