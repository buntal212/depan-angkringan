<template>
  <q-page class="q-pa-md bg-black">
    <!-- Header Section -->
    <HederSatuComponen
      title="MASTER ANGKRINGAN"
      subtitle="Kelola daftar unit angkringan Anda"
      back-route="/"
      @add="onAdd"
    />

    <!-- Menggunakan AppListSatuComponen -->
    <AppListSatuComponen
      :items="store.items"
      :done="store.done"
      :loading="store.loading"
      search-placeholder="Cari nama angkringan atau lokasi..."
      :search-fields="['name', 'location', 'email']"
      @load="onLoad"
      @refresh="onRefresh"
    >
      <template #item="{ item }">
        <q-card class="angkringan-card bg-dark text-white shadow-10">
          <q-card-section>
            <div class="row items-start no-wrap">
              <div class="col">
                <div class="text-h6 text-amber text-weight-bold">{{ item.name }}</div>
                <div class="text-caption text-grey-4 flex items-center q-mt-xs">
                  <q-icon name="place" size="xs" color="red-5" class="q-mr-xs" />
                  {{ item.location }}
                </div>
              </div>
              <q-badge
                :color="item.flag === 'Aktif' ? 'green-5' : 'red-5'"
                text-color="black"
                class="text-weight-bold"
              >
                {{ item.flag }}
              </q-badge>
            </div>

            <div class="q-mt-md">
              <div class="text-caption text-grey-5">Pemilik</div>
              <div class="text-subtitle2 text-weight-medium">{{ item.owner }}</div>
              <div class="text-caption text-grey-5 q-mt-sm">Email</div>
              <div class="text-subtitle2 text-weight-medium">{{ item.email || '-' }}</div>
              <div class="text-caption text-grey-5 q-mt-sm">No Telpon</div>
              <div class="text-subtitle2 text-weight-medium">{{ item.no_telpon }}</div>
            </div>
          </q-card-section>

          <q-separator dark inset />

          <q-card-actions align="right" class="q-pa-sm">
            <q-space />
            <q-btn flat round color="amber" icon="edit" size="sm">
              <q-tooltip>Edit Data</q-tooltip>
            </q-btn>
            <q-btn flat round color="red-5" icon="delete" size="sm">
              <q-tooltip>Hapus Data</q-tooltip>
            </q-btn>

            <!-- <q-btn flat dense color="amber" label="Detail" icon-right="chevron_right" no-caps /> -->
          </q-card-actions>
        </q-card>
      </template>
    </AppListSatuComponen>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useMasterAngkringan } from 'src/stores/masterangkringan'
import AppListSatuComponen from 'src/components/AppListSatuComponen.vue'
import HederSatuComponen from 'src/components/HederSatuComponen.vue'

const store = useMasterAngkringan()

const onAdd = () => {
  // TODO: buka dialog tambah data baru
  // console.log('Tambah baru clicked')
}

onMounted(() => {
  if (store.items.length === 0) {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    const userId = ref(userData.id)
    store.filterAngkringanId = userId.value
    store.getItems()
  }
})

const onRefresh = () => {
  store.resetData()
  store.getItems()
}

const onLoad = async ({ index, done }) => {
  console.log('Index:', index)
  // Tunggu sebentar agar animasi loading terlihat estetik jika load sangat cepat
  await new Promise((resolve) => setTimeout(resolve, 800))

  if (!store.done) {
    await store.getItems(true)
  }
  done()
}
</script>

<style scoped>
.angkringan-card {
  border-radius: 16px;
  border: 1px solid rgba(255, 193, 7, 0.1);
  transition: all 0.3s ease;
}

.angkringan-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 193, 7, 0.4);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

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
</style>
