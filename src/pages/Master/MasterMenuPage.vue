<template>
  <q-page class="q-pa-md bg-black">
    <!-- Header Section -->
    <!-- <span class="text-red">{{ userId }}</span> -->
    <HederSatuComponen
      title="MASTER MENU"
      subtitle="Kelola daftar menu angkringan Anda"
      back-route="/"
      @add="onAdd"
    >
      <template #actions>
        <div class="row justify-center full-width q-mt-md">
          <q-select
            v-if="userId === 1"
            v-model="store.paramsangkringan.filterAngkringanId"
            :options="angkringanOptions"
            emit-value
            map-options
            dark
            outlined
            rounded
            clearable
            dense
            label="Pilih Angkringan"
            bg-color="dark"
            style="min-width: 300px"
            class="q-ml-sm"
            @update:model-value="onChangeAngkringan"
          >
            <template v-slot:prepend>
              <q-icon name="storefront" color="amber" />
            </template>
          </q-select>
        </div>
      </template>
    </HederSatuComponen>

    <!-- Menggunakan AppListSatuComponen -->
    <AppListSatuComponen
      :items="store.items"
      :done="store.done"
      :loading="store.loading"
      search-placeholder="Cari nama menu..."
      :search-fields="['name', 'kategori']"
      @load="onLoad"
    >
      <template #item="{ item }">
        <q-card class="menu-card bg-dark text-white shadow-10">
          <q-card-section>
            <div class="row items-start no-wrap">
              <div class="col">
                <div class="text-h6 text-amber text-weight-bold">{{ item.name }}</div>
                <div class="text-caption text-grey-4 flex items-center q-mt-xs">
                  <q-icon name="category" size="xs" color="amber-5" class="q-mr-xs" />
                  {{ item.kategori || '-' }}
                </div>
              </div>
              <!-- <q-badge
                :color="item.flag === 'aktif' ? 'green-5' : 'red-5'"
                text-color="black"
                class="text-weight-bold"
              >
                {{ item.flag }}
              </q-badge> -->
            </div>

            <!-- Gambar Menu -->
            <!-- <q-img
              :src="item.gambar_url || 'https://cdn.quasar.dev/img/food.jpg'"
              :ratio="16 / 9"
              class="q-mt-md rounded-borders"
              style="border-radius: 12px; max-height: 180px"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-9 text-grey-6">
                  <q-icon name="broken_image" size="2rem" />
                </div>
              </template>
            </q-img> -->

            <div class="q-mt-md">
              <div class="text-caption text-grey-5">Kode Menu</div>
              <div class="text-subtitle2 text-weight-medium">{{ item.kodemenu }}</div>
              <div class="text-caption text-grey-5 q-mt-sm">Harga</div>
              <div class="text-subtitle2 text-weight-medium text-amber">
                Rp {{ Number(item.harga || 0).toLocaleString('id-ID') }}
              </div>
            </div>
          </q-card-section>

          <q-separator dark inset />

          <q-card-actions align="right" class="q-pa-sm">
            <q-space />
            <q-btn flat round color="amber" icon="edit" size="sm" @click="onEdit(item)">
              <q-tooltip>Edit Data</q-tooltip>
            </q-btn>
            <q-btn flat round color="red-5" icon="delete" size="sm" @click="onDelete(item)">
              <q-tooltip>Hapus Data</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
      </template>
    </AppListSatuComponen>

    <!-- Form Dialog -->
    <FormSatuComponen
      v-model="showForm"
      add-title="Tambah Menu Baru"
      edit-title="Edit Menu"
      :fields="formFields"
      :edit-data="editItem"
      :saving="saving"
      :idangkringan="store.paramsangkringan.filterAngkringanId"
      @save="onSave"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useMasterMenu } from 'src/stores/mastermenu'
import { useMasterAngkringan } from 'src/stores/masterangkringan'
import { notifySuccess, notifyError } from 'src/utils/notify'
import AppListSatuComponen from 'src/components/AppListSatuComponen.vue'
import HederSatuComponen from 'src/components/HederSatuComponen.vue'
import FormSatuComponen from 'src/components/FormSatuComponen.vue'

const $q = useQuasar()
const store = useMasterMenu()
const angkringanStore = useMasterAngkringan()
const showForm = ref(false)
const editItem = ref(null)
const saving = ref(false)
const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
const userId = ref(userData.id)

const angkringanOptions = computed(() => [
  {
    label: 'Semua Angkringan',
    value: 'all',
  },

  ...angkringanStore.items.map((item) => ({
    label: item.name,
    value: item.id,
  })),
])

function onChangeAngkringan() {
  store.resetData()
  store.getItems()
}

onMounted(async () => {
  store.resetData()

  if (Number(userId.value) === 1) {
    store.paramsangkringan.filterAngkringanId = 'all'
  } else {
    store.paramsangkringan.filterAngkringanId = userId.value
  }
  await angkringanStore.getItems()
  await store.getItems()
})

// watch(
//   () => store.paramsangkringan.filterAngkringanId,
//   async (val, oldVal) => {
//     if (!val || val === oldVal || store.loading) return

//     store.resetData()

//     await store.getItems()
//   },
// )

const formFields = [
  {
    name: 'kodemenu',
    label: 'Kode Menu',
    type: 'text',
    icon: 'qr_code',
    readonly: true,
  },
  {
    name: 'name',
    label: 'Nama Menu',
    type: 'text',
    icon: 'restaurant_menu',
    rules: [(val) => (val && val.length > 0) || 'Nama menu wajib diisi'],
  },
  {
    name: 'kategori',
    label: 'Kategori',
    type: 'select',
    icon: 'category',
    options: ['Minuman', 'Makanan', 'Snack'],
    rules: [(val) => (val && val.length > 0) || 'Kategori wajib diisi'],
  },
  {
    name: 'harga',
    label: 'Harga',
    type: 'currency',
    icon: 'payments',
    prefix: 'Rp',
    default: 0,
    rules: [
      (val) => (val !== null && val !== '' && val !== 0) || 'Harga wajib diisi dan tidak boleh 0',
    ],
  },
]

const onAdd = () => {
  editItem.value = null
  showForm.value = true
}

const onEdit = (item) => {
  editItem.value = { ...item }
  showForm.value = true
}

const onSave = async (formData) => {
  saving.value = true
  try {
    // if (isEdit && editItem.value) {
    //   if (formData instanceof FormData) {
    //     formData.append('_method', 'PUT')
    //     await store.updateItem(editItem.value.kodemenu, formData)
    //   } else {
    //     await store.updateItem(editItem.value.kodemenu, formData)
    //   }
    //   notifySuccess('Menu berhasil diupdate!')
    // } else {
    await store.addItem(formData)
    notifySuccess('Menu berhasil ditambahkan!')
    // }
    showForm.value = false
    // Reload data agar data terupdate
    store.resetData()
    await store.getItems()
  } catch (error) {
    let msg = 'Gagal menyimpan data.'
    if (error.response?.data?.errors) {
      msg = Object.values(error.response.data.errors)
        .map((e) => e[0])
        .join('\n')
    } else if (error.response?.data?.message) {
      msg = error.response.data.message
    }
    notifyError(msg)
  } finally {
    saving.value = false
  }
}

const onDelete = (item) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Yakin ingin menghapus menu "${item.name}"?`,
    cancel: true,
    persistent: true,
    dark: true,
    color: 'amber',
  }).onOk(async () => {
    try {
      await store.deleteItem(item.kodemenu)
      notifySuccess('Menu berhasil dihapus!')
    } catch (error) {
      console.log(error)
      notifyError('Gagal menghapus menu.')
    }
  })
}

// onMounted merged above

const onLoad = async (index, done) => {
  console.log('Index:', index)

  try {
    await store.getItems()
  } catch (err) {
    console.error(err)
  } finally {
    if (store.done) {
      done(true) // stop infinite scroll
    } else {
      done() // allow more loads
    }
  }
}
</script>

<style scoped>
.menu-card {
  border-radius: 16px;
  border: 1px solid rgba(255, 193, 7, 0.1);
  transition: all 0.3s ease;
}

.menu-card:hover {
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
