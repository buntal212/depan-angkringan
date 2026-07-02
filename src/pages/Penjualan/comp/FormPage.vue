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
            <div class="row items-center">
              <q-icon name="receipt" color="amber" size="20px" />

              <q-space />

              <div class="text-amber text-weight-bold">
                {{ store.form.notrans }}
              </div>
            </div>
            <!-- <q-input
              v-model="store.form.notrans"
              dark
              outlined
              rounded
              dense
              label="No Transaksi"
              placeholder="Auto Generate"
              readonly
            >
              <template #prepend>
                <q-icon name="receipt" color="amber" />
              </template>
            </q-input> -->
            <div class="col-12 col-md-4">
              <q-input
                v-model="store.form.tgl"
                type="date"
                dark
                outlined
                rounded
                dense
                label="Tanggal"
              >
                <template #prepend>
                  <q-icon name="event" color="amber" />
                </template>
              </q-input>
            </div>
          </div>

          <div v-if="isSuperAdmin" class="col-12 col-md-4">
            <q-select
              v-model="store.form.kode_angkringan"
              :options="angkringanOptions"
              emit-value
              map-options
              dark
              outlined
              rounded
              dense
              label="Pilih Angkringan"
            >
              <template #prepend>
                <q-icon name="storefront" color="amber" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-4">
            <q-input v-model="store.form.atasnama" dark outlined rounded dense label="Atas Nama">
              <template #prepend>
                <q-icon name="people" color="amber" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- KATEGORI -->
    <div class="scroll-x q-mb-md">
      <div class="row no-wrap q-gutter-sm">
        <q-chip
          v-for="kat in ['Semua', ...kategoriOptions]"
          :key="kat"
          :color="selectedKategori === kat ? 'amber' : 'dark'"
          :text-color="selectedKategori === kat ? 'black' : 'amber'"
          :outline="selectedKategori !== kat"
          class="category-chip text-weight-bold cursor-pointer"
          clickable
          @click="selectedKategori = kat"
        >
          {{ kat }}
        </q-chip>
      </div>
    </div>

    <!-- SEARCH -->
    <q-input
      v-model="search"
      dark
      outlined
      rounded
      dense
      label="Cari menu..."
      class="q-mb-md"
      bg-color="dark"
    >
      <template #prepend>
        <q-icon name="search" color="amber" />
      </template>
      <template v-if="search" #append>
        <q-icon name="close" color="grey-5" class="cursor-pointer" @click="search = ''" />
      </template>
    </q-input>

    <!-- MENU GRID -->
    <div class="row q-col-gutter-md">
      <div v-for="menu in filteredMenus" :key="menu.kodemenu" class="col-6 col-sm-4 col-md-3">
        <q-card class="menu-card bg-dark text-white shadow-10" @click="addToCart(menu)">
          <q-img :src="menu.gambar_url || '/images/no-image.svg'" :ratio="4 / 3" class="menu-img">
            <template #error>
              <div class="absolute-full flex flex-center bg-grey-9 text-grey-6">
                <q-icon name="broken_image" size="2rem" />
              </div>
            </template>
          </q-img>

          <q-card-section class="q-pa-sm">
            <div class="text-subtitle2 text-weight-bold ellipsis-2-lines">
              {{ menu.name }}
            </div>
            <div class="text-caption text-grey-5">{{ menu.kategori }}</div>
            <div class="text-subtitle1 text-amber text-weight-bold q-mt-xs">
              Rp {{ formatRupiah(menu.harga) }}
            </div>

            <q-badge
              v-if="getQty(menu.kodemenu) > 0"
              color="amber"
              text-color="black"
              floating
              class="text-weight-bold"
            >
              {{ getQty(menu.kodemenu) }}
            </q-badge>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-if="filteredMenus.length === 0" class="empty-box q-mt-md">
      <q-icon name="search_off" size="3rem" color="grey-7" />
      <div class="text-subtitle1 text-grey-6 q-mt-sm">Menu tidak ditemukan</div>
    </div>

    <!-- CART BOTTOM BAR -->
    <div v-if="store.form.items.length > 0" class="cart-bar">
      <div class="cart-info">
        <div class="text-caption text-grey-5">{{ totalItem }} item</div>
        <div class="text-h6 text-amber text-weight-bold">Rp {{ formatRupiah(totalHarga) }}</div>
      </div>
      <q-btn
        rounded
        unelevated
        color="amber"
        text-color="black"
        icon="shopping_cart"
        label="Lihat Keranjang"
        class="cart-btn text-weight-bold"
        @click="showCart = true"
      />
    </div>

    <!-- CART DIALOG -->
    <q-dialog v-model="showCart" position="bottom">
      <q-card class="cart-sheet bg-dark text-white full-width">
        <q-card-section>
          <div class="row items-center q-mb-md">
            <q-icon name="shopping_cart" color="amber" size="md" class="q-mr-sm" />
            <div class="text-h6 text-amber text-weight-bold">Keranjang</div>
            <q-space />
            <q-btn flat round dense icon="close" color="grey-5" @click="showCart = false" />
          </div>

          <div v-if="store.form.items.length === 0" class="empty-box">
            <q-icon name="remove_shopping_cart" size="3rem" color="grey-7" />
            <div class="text-subtitle1 text-grey-6 q-mt-sm">Keranjang kosong</div>
          </div>

          <div v-else>
            <div
              v-for="(item, index) in store.form.items"
              :key="item.kodemenu"
              class="cart-item bg-dark q-pa-sm q-mb-sm"
            >
              <q-card-section class="q-pa-none">
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
            </div>
          </div>

          <q-input
            v-model="store.form.catatan"
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
          </div>

          <q-btn
            rounded
            unelevated
            color="amber"
            text-color="black"
            icon="save"
            label="Simpan Pesanan"
            class="full-width text-weight-bold"
            :loading="store.saving"
            @click="submitForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useMasterMenu } from 'src/stores/mastermenu'
import { useMasterAngkringan } from 'src/stores/masterangkringan'
import { usePenjualanStore } from 'src/stores/penjualan'

const emit = defineEmits(['back'])

const menuStore = useMasterMenu()
const angkringanStore = useMasterAngkringan()
const store = usePenjualanStore()
const showCart = ref(false)

const search = ref('')
const selectedKategori = ref('Semua')

const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
const userId = Number(userData.id || 0)
const isSuperAdmin = computed(() => userId === 1)

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
  return store.form.items.reduce((total, item) => total + Number(item.qty || 0), 0)
})

const totalHarga = computed(() => {
  return store.form.items.reduce((total, item) => total + Number(item.subtotal || 0), 0)
})

function addToCart(menu) {
  const existing = store.form.items.find((item) => item.kodemenu === menu.kodemenu)

  if (existing) {
    existing.qty++
    existing.subtotal = Number(existing.qty || 0) * Number(existing.harga || 0)
    return
  }

  store.form.items.push({
    kodemenu: menu.kodemenu,
    nama_menu: menu.name,
    harga: Number(menu.harga || 0),
    qty: 1,
    subtotal: Number(menu.harga || 0),
    catatan: '',
  })
}

function getQty(kodemenu) {
  const item = store.form.items.find((x) => x.kodemenu === kodemenu)
  return item ? item.qty : 0
}

function increaseQty(index) {
  store.form.items[index].qty++
  calculateSubtotal(index)
}

function decreaseQty(index) {
  if (store.form.items[index].qty > 1) {
    store.form.items[index].qty--
    calculateSubtotal(index)
  } else {
    removeItem(index)
  }
}

function removeItem(index) {
  store.form.items.splice(index, 1)
}

function calculateSubtotal(index) {
  const item = store.form.items[index]
  item.subtotal = Number(item.harga || 0) * Number(item.qty || 0)
}

async function submitForm() {
  try {
    await store.simpanPenjualan()
    // emit('back')
  } catch {
    // error already handled by store with Notify
  }
}

function formatRupiah(value) {
  return Number(value || 0).toLocaleString('id-ID')
}

onMounted(async () => {
  store.form.kode_angkringan = userId
})

onMounted(async () => {
  menuStore.paramsangkringan.per_page = 200
  menuStore.paramsangkringan.filterAngkringanId = userId
  if (!menuStore.items.length) {
    await menuStore.getItems()
  }

  if (!angkringanStore.items.length) {
    await angkringanStore.getItems()
  }
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
  left: 12px;
  right: 12px;
  bottom: 14px;
  z-index: 1000;

  background: #1d1d1d;
  border: 1px solid rgba(255, 193, 7, 0.28);
  border-radius: 18px;
  padding: 12px 14px;

  display: flex;
  align-items: center;
  gap: 22px;

  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.65);
}

.cart-info {
  flex: 1;
  min-width: 0;
}

.cart-btn {
  flex-shrink: 0;
  min-width: 135px;
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
