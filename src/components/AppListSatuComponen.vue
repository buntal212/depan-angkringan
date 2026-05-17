<template>
  <div>
    <div class="row q-col-gutter-sm q-mb-md items-center">
      <div class="col">
        <q-input
          v-model="search"
          :placeholder="searchPlaceholder"
          dark
          outlined
          rounded
          bg-color="dark"
          dense
        >
          <template v-slot:prepend>
            <q-icon name="search" color="amber" />
          </template>
          <template v-if="search.length > 0" v-slot:append>
            <q-icon name="close" color="grey-5" class="cursor-pointer" @click="search = ''" />
          </template>
        </q-input>
      </div>
      <div class="col-auto flex q-gutter-sm">
        <slot name="toolbar" />
      </div>
    </div>

    <!-- List with Infinite Scroll -->
    <q-infinite-scroll @load="onLoad" :offset="150" :disable="done || search.length > 0">
      <div class="row q-col-gutter-md">
        <div
          v-for="(item, index) in filteredItems"
          :key="item[itemKey]"
          class="col-12 col-sm-6 col-md-4 animate-pop-in"
          :style="{ 'animation-delay': `${index * 0.1}s` }"
        >
          <slot name="item" :item="item" :index="index">
            <!-- Default slot fallback -->
            <q-card class="list-card bg-dark text-white shadow-10">
              <!-- Item Image (optional) -->
              <q-img
                v-if="showImage && item[imageField]"
                :src="item[imageField]"
                :ratio="imageRatio"
                :height="imageHeight"
                class="list-card-img"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-grey-9 text-grey-6">
                    <q-icon name="broken_image" size="3rem" />
                  </div>
                </template>
                <template v-slot:loading>
                  <div class="absolute-full flex flex-center bg-grey-10">
                    <q-spinner-dots color="amber" size="2rem" />
                  </div>
                </template>
              </q-img>
              <!-- Placeholder jika showImage aktif tapi tidak ada gambar -->
              <div
                v-else-if="showImage && !item[imageField]"
                class="list-card-img-placeholder flex flex-center bg-grey-9"
                :style="{ height: imageHeight || '180px' }"
              >
                <q-icon name="image" size="3rem" color="grey-7" />
              </div>
              <q-card-section>
                <div class="text-subtitle1 text-amber text-weight-bold">
                  {{ item.name || item.title || 'Item' }}
                </div>
              </q-card-section>
            </q-card>
          </slot>
        </div>
      </div>

      <template v-slot:loading>
        <div v-if="items.length > 0" class="row justify-center q-my-md animate-fade-in">
          <q-spinner-dots color="amber" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>

    <!-- Empty State -->
    <div v-if="loading && items.length === 0" class="flex flex-center column q-pa-xl">
      <q-spinner-dots size="4rem" color="primary" />
      <div class="text-subtitle1 q-mt-md text-grey-6">Memuat data...</div>
    </div>

    <div v-else-if="!loading && filteredItems.length === 0" class="flex flex-center column q-pa-xl">
      <q-icon name="search_off" size="5rem" color="grey-8" />
      <div class="text-h6 text-grey-7 q-mt-md">Data tidak ditemukan</div>

      <div v-if="search.length > 0" class="text-caption text-grey-6 q-mt-sm">
        Tidak ada hasil untuk "{{ search }}"
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  /** Array data items yang akan ditampilkan */
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
  /** Apakah semua data sudah di-load (untuk disable infinite scroll) */
  done: {
    type: Boolean,
    default: false,
  },
  /** Status loading */
  loading: {
    type: Boolean,
    default: false,
  },
  /** Placeholder teks untuk search bar */
  searchPlaceholder: {
    type: String,
    default: 'Cari data...',
  },
  /** Key unik dari item (default: 'id') */
  itemKey: {
    type: String,
    default: 'id',
  },
  /** Array nama field yang akan di-filter saat search */
  searchFields: {
    type: Array,
    default: () => ['name'],
  },
  /** Tampilkan gambar pada item (default: false) */
  showImage: {
    type: Boolean,
    default: false,
  },
  /** Nama field dari item yang berisi URL gambar */
  imageField: {
    type: String,
    default: 'image',
  },
  /** Tinggi gambar (css value, contoh: '180px', '200px') */
  imageHeight: {
    type: String,
    default: '180px',
  },
  /** Rasio gambar (contoh: 16/9, 4/3, 1) */
  imageRatio: {
    type: Number,
    default: 16 / 9,
  },
})

const emit = defineEmits(['load', 'refresh'])

const search = ref('')

const onLoad = (index, done) => {
  emit('load', index, done)
}

const filteredItems = computed(() => {
  if (!search.value) return props.items
  const s = search.value.toLowerCase()
  return props.items.filter((row) =>
    props.searchFields.some((field) => {
      const val = row[field]
      return val && String(val).toLowerCase().includes(s)
    }),
  )
})

// Expose search agar parent bisa akses jika diperlukan
defineExpose({ search, filteredItems })
</script>

<style scoped>
.list-card {
  border-radius: 16px;
  border: 1px solid rgba(255, 193, 7, 0.1);
  transition: all 0.3s ease;
}

.list-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 193, 7, 0.4);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.list-card-img {
  border-radius: 16px 16px 0 0;
}

.list-card-img-placeholder {
  border-radius: 16px 16px 0 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease forwards;
}

.animate-pop-in {
  opacity: 0;
  animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
