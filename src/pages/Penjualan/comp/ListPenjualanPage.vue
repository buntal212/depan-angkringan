<template>
  <q-page class="q-pa-md bg-black">
    <!-- HEADER -->
    <q-card class="top-card bg-dark text-white q-mb-md">
      <q-card-section>
        <div class="row items-center no-wrap">
          <q-btn flat round dense icon="arrow_back" color="amber" @click="emit('back')" />

          <div class="q-ml-md">
            <div class="text-h6 text-amber text-weight-bold">Daftar Penjualan</div>
            <div class="text-caption text-grey-5">Riwayat transaksi penjualan angkringan</div>
          </div>

          <q-space />

          <q-btn
            round
            unelevated
            color="amber"
            text-color="black"
            icon="add"
            @click="emit('add')"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- FILTER -->
    <q-card class="top-card bg-dark text-white q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-sm items-center">
          <div class="col-12 col-md-3">
            <q-input
              v-model="store.paramsList.search"
              dark
              outlined
              rounded
              dense
              debounce="500"
              label="Cari transaksi..."
              @update:model-value="onSearch"
              @keyup.enter="onSearch"
            >
              <template #prepend>
                <q-icon name="search" color="amber" />
              </template>
              <template v-if="store.paramsList.search" #append>
                <q-icon name="close" color="grey-5" class="cursor-pointer" @click="clearSearch" />
              </template>
            </q-input>
          </div>

          <div class="col-6 col-md-2">
            <q-input
              v-model="store.paramsList.dateFrom"
              dark
              outlined
              rounded
              dense
              label="Dari"
              readonly
            >
              <template #prepend>
                <q-icon name="event" color="amber" />
              </template>

              <q-popup-proxy
                ref="dateFromProxy"
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="store.paramsList.dateFrom"
                  mask="YYYY-MM-DD"
                  color="amber"
                  today-btn
                  @update:model-value="onDateFromChange"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="OK" color="amber" text-color="black" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-input>
          </div>

          <div class="col-6 col-md-2">
            <q-input
              v-model="store.paramsList.dateTo"
              dark
              outlined
              rounded
              dense
              label="Sampai"
              readonly
            >
              <template #prepend>
                <q-icon name="event" color="amber" />
              </template>

              <q-popup-proxy
                ref="dateToProxy"
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="store.paramsList.dateTo"
                  mask="YYYY-MM-DD"
                  color="amber"
                  today-btn
                  @update:model-value="onDateFromChange"
                >
                  <div class="row justify-end">
                    <q-btn v-close-popup label="OK" color="amber" text-color="black" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-input>
          </div>

          <div v-if="isSuperAdmin" class="col-12 col-md-3">
            <q-select
              v-model="store.paramsList.angkringan_id"
              :options="angkringanOptions"
              emit-value
              map-options
              dark
              outlined
              rounded
              dense
              clearable
              label="Pilih Angkringan"
              @update:model-value="caribyangkringan"
            >
              <template #prepend>
                <q-icon name="storefront" color="amber" />
              </template>
            </q-select>
          </div>

          <div class="col-auto flex q-gutter-sm">
            <q-btn
              round
              unelevated
              color="amber"
              text-color="black"
              icon="search"
              @click="onSearch"
            />
            <q-btn round flat color="grey-5" icon="refresh" @click="onReset" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- LIST -->
    <div class="list-wrapper">
      <template v-if="store.loadingList && store.listPenjualan.length === 0">
        <q-card v-for="n in 3" :key="n" class="top-card bg-dark q-mb-md skeleton-card">
          <q-card-section>
            <div class="row items-start no-wrap">
              <div class="col">
                <q-skeleton type="text" width="45%" class="q-mb-sm" />
                <q-skeleton type="text" width="65%" />
                <q-skeleton type="text" width="35%" class="q-mt-sm" />
                <q-skeleton type="text" width="50%" class="q-mt-sm" />
              </div>

              <div class="col-auto text-right">
                <q-skeleton type="text" width="70px" />
                <q-skeleton type="text" width="100px" class="q-mt-sm" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </template>

      <div v-else-if="store.listPenjualan.length === 0" class="empty-box">
        <q-icon name="receipt_long" size="4rem" color="grey-7" />
        <div class="text-h6 text-grey-6 q-mt-md">Belum ada data penjualan</div>
      </div>

      <div v-else ref="scrollTargetRef" class="scroll-list">
        <q-infinite-scroll @load="onLoadPenjualan" :offset="250" :disable="store.doneList">
          <q-slide-item
            v-for="item in store.listPenjualan"
            class="slide-card q-mb-md"
            :key="item.id"
            right-color="dark"
            @left="({ reset }) => onSlideEdit(item, reset)"
            @right="({ reset }) => onSlideBayar(item, reset)"
          >
            <!-- Tombol yang muncul saat swipe -->
            <template #left>
              <q-icon name="edit" color="white" size="30px" />
            </template>

            <!-- Geser ke kanan -->
            <template #right>
              <q-icon name="payments" color="white" size="30px" />
            </template>

            <q-card
              class="top-card bg-dark text-white q-mb-md"
              style="border-radius: 16px; overflow: hidden"
            >
              <q-card-section>
                <div class="row items-start no-wrap">
                  <div class="col">
                    <div class="row items-center q-gutter-sm q-mb-xs">
                      <q-icon name="receipt" color="amber" size="sm" />
                      <span class="text-subtitle1 text-amber text-weight-bold">
                        {{ item.no_transaksi || '-' }}
                      </span>
                    </div>

                    <div class="text-caption text-grey-5 flex items-center q-mt-xs">
                      <q-icon name="event" size="xs" color="amber-5" class="q-mr-xs" />
                      {{ formatTanggal(item.tanggal_transaksi) }}
                    </div>

                    <div
                      v-if="item.angkringan?.nama_angkringan"
                      class="text-caption text-grey-5 flex items-center q-mt-xs"
                    >
                      <q-icon name="storefront" size="xs" color="amber-5" class="q-mr-xs" />
                      {{ item.angkringan.nama_angkringan }}
                    </div>

                    <div class="text-caption text-grey-5 flex items-center q-mt-xs">
                      <q-icon name="shopping_bag" size="xs" color="amber-5" class="q-mr-xs" />
                      {{ (item.rinci || []).length }} item
                    </div>
                    <div class="text-caption text-grey-5 flex items-center q-mt-xs">
                      <q-icon name="price_change" size="xs" color="amber-5" class="q-mr-xs" />
                      <q-badge
                        v-if="item.flag"
                        :color="item.flag === '2' ? 'green-5' : 'red-5'"
                        text-color="black"
                        class="text-weight-bold"
                      >
                        {{ label(item.flag) }}
                      </q-badge>
                    </div>
                  </div>

                  <div class="col-auto text-right total-box">
                    <div class="text-caption text-grey-5">Total</div>
                    <div class="text-h6 text-amber text-weight-bold">
                      Rp {{ formatRupiah(item.total_harga) }}
                    </div>
                  </div>
                </div>
                <div class="text-caption text-grey-5 flex items-center q-mt-xs">
                  <q-icon name="people" size="xs" color="amber-5" class="q-mr-xs" />
                  {{ item.atasnama || '-' }}
                </div>
                <div class="text-caption text-grey-4 q-mt-sm">
                  <q-icon name="notes" size="xs" class="q-mr-xs" />
                  {{ item.keterangan }}
                </div>
              </q-card-section>

              <!-- EXPANDABLE DETAIL -->
              <div v-if="item.rinci && item.rinci.length > 0">
                <q-separator dark />

                <q-expansion-item dark header-class="text-amber" expand-icon="expand_more">
                  <template #header>
                    <q-item-section avatar>
                      <q-icon name="list_alt" color="amber" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <span class="text-caption">Detail Item</span>
                    </q-item-section>
                  </template>

                  <q-card flat class="bg-dark">
                    <q-card-section>
                      <div
                        v-for="(rinci, idx) in item.rinci"
                        :key="rinci.id || idx"
                        class="row items-center no-wrap q-py-xs"
                        :class="{ 'q-mt-xs': idx > 0 }"
                      >
                        <div class="col">
                          <div class="text-body2 text-white">
                            {{ rinci?.menu?.name || '-' }}
                          </div>
                          <div class="text-caption text-grey-5">
                            {{ Number(rinci.jumlah || 0) }} x Rp
                            {{ formatRupiah(rinci.harga_satuan) }}
                          </div>
                        </div>
                        <div class="col-auto text-amber text-weight-bold text-body2">
                          Rp {{ formatRupiah(rinci.subtotal) }}
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </div>
            </q-card>
          </q-slide-item>
          <template #loading>
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="amber" size="40px" />
            </div>
          </template>
        </q-infinite-scroll>
      </div>
    </div>

    <q-dialog v-model="store.showDialogBayar" position="bottom">
      <q-card class="payment-sheet bg-dark text-white">
        <q-card-section class="row items-center">
          <div>
            <div class="text-h6 text-amber text-weight-bold">Pembayaran</div>
            <div class="text-caption text-grey-5">
              {{ store.formBayar.no_transaksi }}
            </div>
          </div>

          <q-space />

          <q-btn flat round dense icon="close" color="grey-5" v-close-popup />
        </q-card-section>

        <q-separator dark />

        <q-card-section>
          <div class="payment-total-card">
            <div class="text-caption text-grey-5">Total Tagihan</div>
            <div class="text-h4 text-amber text-weight-bold">
              Rp {{ formatRupiah(store.formBayar.total) }}
            </div>
          </div>

          <q-select
            v-model="store.formBayar.metode_bayar"
            :options="['CASH', 'QRIS', 'TRANSFER']"
            dark
            outlined
            rounded
            dense
            label="Metode Bayar"
            class="q-mt-md"
          />

          <q-input
            :model-value="formatRupiah(store.formBayar.dibayar)"
            dark
            outlined
            rounded
            dense
            type="number"
            label="Nominal Dibayar"
            class="q-mt-md"
            @update:model-value="updateNominal"
          />

          <div class="row q-col-gutter-sm q-mt-sm">
            <div class="col-4">
              <q-btn
                class="full-width quick-btn"
                color="amber"
                text-color="black"
                label="Uang Pas"
                @click="setUangPas"
              />
            </div>

            <div
              v-for="nominal in [10000, 20000, 50000, 100000, 150000]"
              :key="nominal"
              class="col-4"
            >
              <q-btn
                class="full-width quick-btn"
                unelevated
                :color="store.formBayar.dibayar === nominal ? 'amber' : 'grey-9'"
                :text-color="store.formBayar.dibayar === nominal ? 'black' : 'white'"
                :icon="store.formBayar.dibayar === nominal ? 'check' : ''"
                :label="formatRupiah(nominal)"
                @click="setNominalBayar(nominal)"
              />
            </div>
          </div>

          <div class="change-card q-mt-md">
            <div class="text-caption text-grey-5">Kembalian</div>
            <div
              class="text-h5 text-weight-bold"
              :class="store.formBayar.kembalian < 0 ? 'text-red-5' : 'text-green-5'"
            >
              Rp {{ formatRupiah(store.formBayar.kembalian) }}
            </div>
          </div>

          <div class="row q-col-gutter-sm q-mt-md">
            <div
              v-for="key in ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '000']"
              :key="key"
              class="col-4"
            >
              <q-btn
                class="full-width calc-btn"
                color="black"
                text-color="amber"
                :label="key"
                @click="store.tekanKalkulatorBayar(key)"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <q-btn
            rounded
            unelevated
            color="amber"
            text-color="black"
            icon="payments"
            label="Simpan Pembayaran"
            class="full-width text-weight-bold"
            :disable="store.formBayar.kembalian < 0"
            :loading="store.loadingBayar"
            @click="store.simpanPembayaran()"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { usePenjualanStore } from 'src/stores/penjualan'
import { useMasterAngkringan } from 'src/stores/masterangkringan'

const emit = defineEmits(['add', 'edit', 'back'])
const store = usePenjualanStore()
const angkringanStore = useMasterAngkringan()

const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
const userId = Number(userData.id || 0)
const isSuperAdmin = computed(() => userId === 1)

const angkringanOptions = computed(() =>
  angkringanStore.items.map((item) => ({
    label: item.name,
    value: item.id,
  })),
)

function label(val) {
  if (val == '1') {
    return 'Belum Bayar'
  } else {
    return 'Lunas'
  }
}

async function clearSearch() {
  store.paramsList.search = ''
  await store.reloadListPenjualan()
}

const scrollTargetRef = ref(null)

function formatRupiah(value) {
  return Number(value || 0).toLocaleString('id-ID')
}

function formatTanggal(tgl) {
  if (!tgl) return '-'
  const d = new Date(tgl)
  if (isNaN(d)) return tgl
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function onSearch() {
  store.reloadListPenjualan()
}

function onReset() {
  store.resetListFilter()
  store.getListPenjualan(false)
}

function onSlideEdit(item, reset) {
  reset()
  emit('edit', item)
}

async function caribyangkringan() {
  await store.reloadListPenjualan()
}

function onSlideBayar(item, reset) {
  reset()

  if (item.flag != '1') return

  store.openDialogBayar(item)
}

function setUangPas() {
  store.formBayar.dibayar = store.formBayar.total
  store.hitungKembalian()
}

function setNominalBayar(nominal) {
  store.formBayar.dibayar = nominal
  store.hitungKembalian()
}

function updateNominal(val) {
  store.formBayar.dibayar = Number(String(val).replace(/\./g, '').replace(/\D/g, ''))

  store.hitungKembalian()
}

async function onLoadPenjualan(index, done) {
  await store.getListPenjualan(true)
  done()
}

const dateFromProxy = ref(null)
const dateToProxy = ref(null)

async function onDateFromChange() {
  dateFromProxy.value?.hide()
  await store.reloadListPenjualan()
}

onMounted(async () => {
  if (isSuperAdmin.value) {
    store.paramsList.angkringan_id = null
  } else {
    store.paramsList.angkringan_id = userId
  }

  if (!angkringanStore.items.length) {
    await angkringanStore.getItems()
  }

  await store.reloadListPenjualan()
})
</script>

<style scoped>
.top-card {
  border-radius: 16px;
  border: 1px solid rgba(255, 193, 7, 0.12);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
}

.empty-box {
  min-height: 200px;
  border: 1px dashed rgba(255, 193, 7, 0.25);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.slide-card {
  background: #121212;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
}

.slide-card :deep(.q-card) {
  margin-bottom: 0 !important;
  border-radius: 16px;
}
.payment-sheet {
  border-radius: 24px 24px 0 0;
  max-height: 92vh;
  overflow-y: auto;
}

.payment-total-card,
.change-card {
  border: 1px solid rgba(255, 193, 7, 0.16);
  border-radius: 18px;
  padding: 16px;
  background: rgba(255, 193, 7, 0.06);
}

.quick-btn {
  border-radius: 12px;
  min-height: 42px;
  font-weight: bold;
}

.calc-btn {
  border-radius: 16px;
  min-height: 54px;
  font-size: 18px;
  font-weight: bold;
}

.list-wrapper {
  min-height: 220px;
}

.skeleton-card {
  border-radius: 16px;
  overflow: hidden;
}

.total-box {
  margin-top: 34px;
}
</style>
