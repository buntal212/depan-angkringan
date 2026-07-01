<template>
  <q-page class="bg-black text-white q-pa-md">
    <!-- HEADER -->
    <q-card class="top-card bg-dark text-white q-mb-md">
      <q-card-section>
        <div class="row items-center no-wrap">
          <q-btn flat round dense icon="arrow_back" color="amber" @click="emit('back')" />

          <div class="q-ml-md">
            <div class="text-h6 text-amber text-weight-bold">Pemesanan</div>
            <div class="text-caption text-grey-5">Tap menu untuk tambah pesanan</div>
          </div>

          <q-space />

          <q-btn
            round
            unelevated
            color="amber"
            text-color="black"
            icon="shopping_cart"
            @click="showCart = true"
          >
            <q-badge v-if="totalItem > 0" color="red" floating>
              {{ totalItem }}
            </q-badge>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>

    <!-- INFO TRANSAKSI -->
    <q-card class="top-card bg-dark text-white q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-4">
            <q-input v-model="form.tgl" type="date" dark outlined rounded dense label="Tanggal">
              <template #prepend>
                <q-icon name="event" color="amber" />
              </template>
            </q-input>
          </div>

          <div v-if="isSuperAdmin" class="col-12 col-md-4">
            <q-select
              v-model="form.kode_angkringan"
              :options="angkringanOptions"
              emit-value
              map-options
              dark
              outlined
              rounded
              dense
              clearable
              label="Pilih Angkringan"
            >
              <template #prepend>
                <q-icon name="storefront" color="amber" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="form.metode_bayar"
              :options="metodeBayarOptions"
              dark
              outlined
              rounded
              dense
              label="Metode Bayar"
            >
              <template #prepend>
                <q-icon name="payments" color="amber" />
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- SEARCH -->
    <q-input
      v-model="search"
      dark
      outlined
      rounded
      dense
      debounce="300"
      label="Cari menu..."
      class="q-mb-md"
    >
      <template #prepend>
        <q-icon name="search" color="amber" />
      </template>
    </q-input>

    <!-- KATEGORI -->
    <div class="row no-wrap q-gutter-sm q-mb-md scroll-x">
      <q-chip
        clickable
        :color="selectedKategori === 'Semua' ? 'amber' : 'dark'"
        :text-color="selectedKategori === 'Semua' ? 'black' : 'white'"
        class="category-chip"
        @click="selectedKategori = 'Semua'"
      >
        Semua
      </q-chip>

      <q-chip
        v-for="kat in kategoriOptions"
        :key="kat"
        clickable
        :color="selectedKategori === kat ? 'amber' : 'dark'"
        :text-color="selectedKategori === kat ? 'black' : 'white'"
        class="category-chip"
        @click="selectedKategori = kat"
      >
        {{ kat }}
      </q-chip>
    </div>

    <!-- MENU GRID -->
    <div class="row q-col-gutter-md q-pb-xl">
      <div v-for="menu in filteredMenus" :key="menu.kodemenu" class="col-6 col-sm-4 col-md-3">
        <q-card class="menu-card bg-dark text-white" @click="addToCart(menu)">
          <q-img
            :src="menu.gambar_url || 'https://cdn.quasar.dev/img/food.jpg'"
            :ratio="1"
            class="menu-img"
          >
            <template #error>
              <div class="absolute-full flex flex-center bg-grey-9">
                <q-icon name="restaurant_menu" size="40px" color="grey-6" />
              </div>
            </template>

            <div v-if="getQty(menu.kodemenu) > 0" class="absolute-top-right q-pa-xs">
              <q-badge color="amber" text-color="black"> x{{ getQty(menu.kodemenu) }} </q-badge>
            </div>
          </q-img>

          <q-card-section class="q-pa-sm">
            <div class="text-subtitle2 text-weight-bold ellipsis">
              {{ menu.name }}
            </div>

            <div class="text-caption text-grey-5 ellipsis">
              {{ menu.kategori || '-' }}
            </div>

            <div class="row items-center q-mt-sm">
              <div class="text-amber text-weight-bold">Rp {{ formatRupiah(menu.harga) }}</div>

              <q-space />

              <q-btn
                round
                dense
                unelevated
                color="amber"
                text-color="black"
                icon="add"
                size="sm"
                @click.stop="addToCart(menu)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div v-if="filteredMenus.length === 0" class="col-12">
        <div class="empty-box">
          <q-icon name="search_off" size="44px" color="grey-7" />
          <div class="text-grey-5 q-mt-sm">Menu tidak ditemukan</div>
        </div>
      </div>
    </div>

    <!-- STICKY CART BAR -->
    <div v-if="totalItem > 0" class="cart-bar">
      <div class="cart-info">
        <div class="text-caption text-grey-5">{{ totalItem }} item</div>
        <div class="text-h6 text-amber text-weight-bold">Rp {{ formatRupiah(totalHarga) }}</div>
      </div>

      <q-btn
        class="cart-btn text-weight-bold"
        rounded
        unelevated
        color="amber"
        text-color="black"
        icon="shopping_cart_checkout"
        label="Keranjang"
        @click="showCart = true"
      />
    </div>

    <!-- CART BOTTOM SHEET -->
    <q-dialog v-model="showCart" position="bottom">
      <q-card class="cart-sheet bg-dark text-white">
        <q-card-section>
          <div class="row items-center">
            <div>
              <div class="text-h6 text-amber text-weight-bold">Keranjang</div>
              <div class="text-caption text-grey-5">Cek pesanan sebelum simpan</div>
            </div>

            <q-space />

            <q-btn flat round dense icon="close" color="grey-5" v-close-popup />
          </div>
        </q-card-section>

        <q-separator dark />

        <q-card-section>
          <div v-if="form.items.length === 0" class="empty-box">
            <q-icon name="shopping_cart" size="44px" color="grey-7" />
            <div class="text-grey-5 q-mt-sm">Keranjang kosong</div>
          </div>

          <div v-else class="column q-gutter-sm">
            <q-card
              v-for="(item, index) in form.items"
              :key="item.kodemenu"
              flat
              class="cart-item bg-black text-white"
            >
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="text-subtitle2 text-weight-bold">
                      {{ item.nama_menu }}
                    </div>
                    <div class="text-caption text-grey-5">Rp {{ formatRupiah(item.harga) }}</div>
                    <div class="text-amber text-weight-bold q-mt-xs">
                      Rp {{ formatRupiah(item.subtotal) }}
                    </div>
                  </div>

                  <div class="qty-box">
                    <q-btn
                      flat
                      round
                      dense
                      icon="remove"
                      color="amber"
                      @click="decreaseQty(index)"
                    />
                    <div class="qty-number">{{ item.qty }}</div>
                    <q-btn flat round dense icon="add" color="amber" @click="increaseQty(index)" />
                  </div>

                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="red-5"
                    class="q-ml-sm"
                    @click="removeItem(index)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <q-input
            v-model="form.catatan"
            dark
            outlined
            rounded
            dense
            label="Catatan"
            class="q-mt-md"
          >
            <template #prepend>
              <q-icon name="notes" color="amber" />
            </template>
          </q-input>
        </q-card-section>

        <q-separator dark />

        <q-card-section>
          <div class="row items-center q-mb-md">
            <div>
              <div class="text-caption text-grey-5">Total Pembayaran</div>
              <div class="text-h5 text-amber text-weight-bold">
                Rp {{ formatRupiah(totalHarga) }}
              </div>
            </div>

            <q-space />

            <q-chip color="amber" text-color="black" class="text-weight-bold">
              {{ form.metode_bayar }}
            </q-chip>
          </div>

          <q-btn
            rounded
            unelevated
            color="amber"
            text-color="black"
            icon="save"
            label="Simpan Pesanan"
            class="full-width text-weight-bold"
            :loading="saving"
            @click="submitForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useMasterMenu } from 'src/stores/mastermenu'
import { useMasterAngkringan } from 'src/stores/masterangkringan'
import { usePenjualanStore } from 'src/stores/penjualan'

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['back'])
const penjualanStore = usePenjualanStore()
const $q = useQuasar()
const menuStore = useMasterMenu()
const angkringanStore = useMasterAngkringan()

const showCart = ref(false)
const saving = ref(false)
const search = ref('')
const selectedKategori = ref('Semua')

const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
const userId = Number(userData.id || 0)
const isSuperAdmin = computed(() => userId === 1)

const metodeBayarOptions = ['CASH', 'QRIS', 'TRANSFER']

// const form = reactive({
//   tgl: new Date().toISOString().slice(0, 10),
//   kode_angkringan: null,
//   metode_bayar: 'CASH',
//   catatan: '',
//   items: [],
// })
const form = penjualanStore.form
const angkringanOptions = computed(() =>
  angkringanStore.items.map((item) => ({
    label: item.name,
    value: item.id,
  })),
)

const kategoriOptions = computed(() => {
  return [
    ...new Set(menuStore.items.map((item) => item.kategori).filter((item) => item && item !== '')),
  ]
})

const filteredMenus = computed(() => {
  let menus = menuStore.items || []

  if (selectedKategori.value !== 'Semua') {
    menus = menus.filter((item) => item.kategori === selectedKategori.value)
  }

  if (search.value) {
    const s = search.value.toLowerCase()
    menus = menus.filter(
      (item) =>
        String(item.name || '')
          .toLowerCase()
          .includes(s) ||
        String(item.kategori || '')
          .toLowerCase()
          .includes(s) ||
        String(item.kodemenu || '')
          .toLowerCase()
          .includes(s),
    )
  }

  return menus
})

const totalItem = computed(() => {
  return form.items.reduce((total, item) => total + Number(item.qty || 0), 0)
})

const totalHarga = computed(() => {
  return form.items.reduce((total, item) => total + Number(item.subtotal || 0), 0)
})

function addToCart(menu) {
  const existing = form.items.find((item) => item.kodemenu === menu.kodemenu)

  if (existing) {
    existing.qty++
    existing.subtotal = Number(existing.qty || 0) * Number(existing.harga || 0)
    return
  }

  form.items.push({
    kodemenu: menu.kodemenu,
    nama_menu: menu.name,
    harga: Number(menu.harga || 0),
    qty: 1,
    subtotal: Number(menu.harga || 0),
  })
}

function getQty(kodemenu) {
  const item = form.items.find((x) => x.kodemenu === kodemenu)
  return item ? item.qty : 0
}

function increaseQty(index) {
  form.items[index].qty++
  calculateSubtotal(index)
}

function decreaseQty(index) {
  if (form.items[index].qty > 1) {
    form.items[index].qty--
    calculateSubtotal(index)
  } else {
    removeItem(index)
  }
}

function removeItem(index) {
  form.items.splice(index, 1)
}

function calculateSubtotal(index) {
  const item = form.items[index]
  item.subtotal = Number(item.harga || 0) * Number(item.qty || 0)
}

function validateForm() {
  if (isSuperAdmin.value && !form.kode_angkringan) return 'Angkringan wajib dipilih'
  if (!form.metode_bayar) return 'Metode bayar wajib dipilih'
  if (form.items.length === 0) return 'Keranjang masih kosong'

  return null
}

async function submitForm() {
  const error = validateForm()

  if (error) {
    $q.notify({
      type: 'negative',
      message: error,
      position: 'top',
    })
    return
  }

  const payload = {
    tgl: form.tgl,
    kode_angkringan: form.kode_angkringan,
    metode_bayar: form.metode_bayar,
    catatan: form.catatan,
    total: totalHarga.value,
    items: form.items.map((item) => ({
      kodemenu: item.kodemenu,
      nama_menu: item.nama_menu,
      harga: item.harga,
      qty: item.qty,
      subtotal: item.subtotal,
    })),
  }

  saving.value = true

  try {
    console.log('PAYLOAD PENJUALAN:', payload)

    // NANTI GANTI KE STORE PENJUALAN:
    // await penjualanStore.addItem(payload)

    $q.notify({
      type: 'positive',
      message: 'Pesanan berhasil disimpan',
      position: 'top',
    })

    emit('back')
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Gagal menyimpan pesanan',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}

function setEditData() {
  if (!props.data) return

  form.tgl = props.data.tgl || new Date().toISOString().slice(0, 10)
  form.kode_angkringan = props.data.kode_angkringan || null
  form.metode_bayar = props.data.metode_bayar || 'CASH'
  form.catatan = props.data.catatan || ''
  form.items = props.data.items || []
}

function formatRupiah(value) {
  return Number(value || 0).toLocaleString('id-ID')
}

onMounted(async () => {
  console.log('sasa')
  if (!menuStore.items.length) {
    await menuStore.getItems()
  }

  if (!angkringanStore.items.length) {
    await angkringanStore.getItems()
  }
  console.log('MENU ITEMS:', menuStore.items)
  console.log('KATEGORI:', kategoriOptions.value)
  setEditData()
})
</script>

<style scoped>
.top-card,
.menu-card,
.cart-item {
  border-radius: 16px;
  border: 1px solid rgba(255, 193, 7, 0.12);
}

.top-card {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
}

.menu-card {
  overflow: hidden;
  transition: all 0.25s ease;
  cursor: pointer;
}

.menu-card:active {
  transform: scale(0.97);
}

.menu-img {
  border-radius: 14px 14px 0 0;
}

.category-chip {
  border: 1px solid rgba(255, 193, 7, 0.18);
}

.scroll-x {
  overflow-x: auto;
  padding-bottom: 4px;
}

.scroll-x::-webkit-scrollbar {
  display: none;
}

.empty-box {
  min-height: 150px;
  border: 1px dashed rgba(255, 193, 7, 0.25);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cart-bar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);

  width: calc(100% - 32px);
  max-width: 500px;

  padding: 16px 20px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(12px);

  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);

  z-index: 999;
}

.cart-info {
  flex: 1;
  min-width: 0;
  padding-right: 28px;
}

.cart-btn {
  flex-shrink: 0;
  min-width: 150px;
}

.cart-sheet {
  border-radius: 24px 24px 0 0;
  max-height: 85vh;
  overflow-y: auto;
}

.qty-box {
  height: 38px;
  min-width: 105px;
  border: 1px solid rgba(255, 193, 7, 0.25);
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.qty-number {
  min-width: 30px;
  text-align: center;
  font-weight: bold;
  color: #ffc107;
}
</style>
