<template>
  <q-page class="report-page bg-black text-white q-pa-md">
    <HederSatuComponen
      title="Laporan Penjualan"
      subtitle="Analisa transaksi penjualan seluruh outlet."
      back-route="/"
      :show-add-button="false"
      @refresh="refreshReport"
    >
      <template #actions>
        <q-btn
          outline
          rounded
          color="amber"
          icon="picture_as_pdf"
          label="Export PDF"
          class="text-weight-bold"
          :disable="!store.transactions.length"
          @click="exportPdf"
        />
        <q-btn
          outline
          rounded
          color="amber"
          icon="table_view"
          label="Export Excel"
          class="text-weight-bold"
          :disable="!store.transactions.length"
          @click="store.exportExcel"
        />
      </template>
    </HederSatuComponen>

    <q-card class="surface-card filter-card bg-dark text-white q-mb-md animate-enter">
      <q-card-section class="row items-center q-pb-sm">
        <div>
          <div class="text-subtitle1 text-weight-bold">Filter Laporan</div>
          <div class="text-caption text-grey-5">Sesuaikan data berdasarkan kebutuhan analisa</div>
        </div>
        <q-space />
        <q-icon name="tune" color="amber" size="md" />
      </q-card-section>
      <q-card-section class="q-pt-sm">
        <q-form @submit.prevent="store.fetchReport">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6 col-lg-3">
              <q-select
                v-model="store.filters.outlet"
                :options="outletOptions"
                :loading="store.loadingOutlets"
                dark
                outlined
                rounded
                dense
                clearable
                emit-value
                map-options
                label="Outlet"
              >
                <template #prepend><q-icon name="storefront" color="amber" /></template>
              </q-select>
            </div>
            <div class="col-6 col-lg-2">
              <q-input
                v-model="store.filters.dateFrom"
                dark
                outlined
                rounded
                dense
                readonly
                label="Dari Tanggal"
              >
                <template #prepend><q-icon name="event" color="amber" /></template>
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="store.filters.dateFrom"
                    mask="YYYY-MM-DD"
                    color="amber"
                    today-btn
                  >
                    <div class="row justify-end">
                      <q-btn v-close-popup flat color="amber" label="Tutup" />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-input>
            </div>
            <div class="col-6 col-lg-2">
              <q-input
                v-model="store.filters.dateTo"
                dark
                outlined
                rounded
                dense
                readonly
                label="Sampai Tanggal"
              >
                <template #prepend><q-icon name="event" color="amber" /></template>
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="store.filters.dateTo"
                    mask="YYYY-MM-DD"
                    color="amber"
                    today-btn
                    :options="validEndDate"
                  >
                    <div class="row justify-end">
                      <q-btn v-close-popup flat color="amber" label="Tutup" />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-input>
            </div>
            <div class="col-12 col-sm-6 col-lg-2">
              <q-select
                v-model="store.filters.paymentMethod"
                :options="paymentMethods"
                dark
                outlined
                rounded
                dense
                clearable
                label="Metode Pembayaran"
              >
                <template #prepend><q-icon name="payments" color="amber" /></template>
              </q-select>
            </div>
            <div class="col-12 col-sm-6 col-lg-3">
              <q-select
                v-model="store.filters.paymentStatus"
                :options="paymentStatuses"
                dark
                outlined
                rounded
                dense
                clearable
                emit-value
                map-options
                label="Status Pembayaran"
              >
                <template #prepend><q-icon name="verified" color="amber" /></template>
              </q-select>
            </div>
            <div class="col-12 col-lg-8">
              <q-input
                v-model="store.filters.search"
                dark
                outlined
                rounded
                dense
                clearable
                label="Search"
                placeholder="No transaksi, kasir, atau pelanggan..."
              >
                <template #prepend><q-icon name="search" color="amber" /></template>
              </q-input>
            </div>
            <div class="col-12 col-lg-4 row justify-end items-center q-gutter-sm filter-actions">
              <q-btn
                flat
                rounded
                color="grey-5"
                icon="restart_alt"
                label="Reset"
                :disable="store.loading"
                @click="store.resetFilters"
              />
              <q-btn
                unelevated
                rounded
                color="amber"
                text-color="black"
                icon="search"
                label="Cari"
                class="text-weight-bold"
                type="submit"
                :loading="store.loading"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md q-mb-md animate-enter animate-enter--delay-1">
      <div v-for="card in summaryCards" :key="card.label" class="col-12 col-sm-6 col-lg-3">
        <ReportSummaryCard v-bind="card" :loading="store.loading && !store.transactions.length" />
      </div>
    </div>

    <SalesCharts
      class="q-mb-md animate-enter animate-enter--delay-2"
      :daily-data="store.dailySales"
      :payment-data="store.paymentSales"
      :loading="store.loading && !store.transactions.length"
    />

    <q-card
      class="surface-card transaction-section bg-dark text-white animate-enter animate-enter--delay-3"
    >
      <q-card-section class="row items-center">
        <div>
          <div class="text-subtitle1 text-weight-bold">Daftar Transaksi</div>
          <div class="text-caption text-grey-5">
            {{ store.transactions.length }} transaksi
            <span v-if="store.lastUpdated"> · Diperbarui {{ lastUpdatedLabel }}</span>
          </div>
        </div>
        <q-space />
        <q-badge color="amber" text-color="black" class="q-pa-sm text-weight-bold"
          >Periode Terpilih</q-badge
        >
      </q-card-section>
      <q-separator dark />

      <div v-if="store.error" class="error-state">
        <q-icon name="cloud_off" size="56px" color="red-5" />
        <div class="text-h6 q-mt-sm">Gagal memuat laporan</div>
        <div class="text-body2 text-grey-5 q-mt-xs text-center">{{ store.error }}</div>
        <q-btn
          outline
          rounded
          color="amber"
          icon="refresh"
          label="Coba Lagi"
          class="q-mt-md"
          @click="store.fetchReport"
        />
      </div>

      <div v-else-if="store.loading" class="q-pa-md">
        <q-card v-for="item in 4" :key="item" flat class="transaction-skeleton bg-grey-10 q-mb-md">
          <q-card-section>
            <div class="row items-center q-col-gutter-md">
              <div class="col-8">
                <q-skeleton type="text" width="55%" /><q-skeleton type="text" width="75%" />
              </div>
              <div class="col-4"><q-skeleton type="QBadge" class="float-right" /></div>
            </div>
            <div class="row q-col-gutter-md q-mt-sm">
              <div v-for="field in 6" :key="field" class="col-12 col-sm-6 col-lg-4">
                <q-skeleton type="rect" height="54px" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div v-else-if="!store.transactions.length" class="empty-state">
        <div class="empty-icon"><q-icon name="receipt_long" size="64px" color="amber-8" /></div>
        <div class="text-h6 text-grey-4 q-mt-md">Belum ada transaksi</div>
        <div class="text-caption text-grey-6 text-center">
          Ubah filter atau periode untuk melihat data lainnya.
        </div>
        <q-btn
          flat
          rounded
          color="amber"
          icon="restart_alt"
          label="Reset Filter"
          class="q-mt-sm"
          @click="store.resetFilters"
        />
      </div>

      <div v-else class="transaction-list q-pa-md">
        <q-card
          v-for="(transaction, index) in store.transactions"
          :key="transaction.id || transactionNumber(transaction)"
          flat
          class="transaction-card bg-grey-10 text-white q-mb-md"
          :style="{ '--delay': `${Math.min(index, 8) * 35}ms` }"
        >
          <q-card-section class="transaction-header">
            <div class="row items-start q-col-gutter-sm">
              <div class="col-12 col-sm">
                <div class="row items-center q-gutter-sm">
                  <q-icon name="receipt_long" color="amber" size="sm" />
                  <div class="transaction-number text-amber text-weight-bold text-wrap">
                    {{ transactionNumber(transaction) }}
                  </div>
                </div>
                <div class="text-caption text-grey-5 q-mt-xs row items-center">
                  <q-icon name="schedule" size="15px" class="q-mr-xs" />
                  {{ formatDateTime(transactionDate(transaction)) }}
                </div>
              </div>
              <div class="col-12 col-sm-auto row q-gutter-xs items-center">
                <q-badge rounded color="grey-9" text-color="amber" class="payment-badge q-pa-sm">
                  <q-icon name="payments" class="q-mr-xs" />{{ paymentMethod(transaction) }}
                </q-badge>
                <q-badge
                  rounded
                  :color="isPaid(transaction) ? 'green-5' : 'red-5'"
                  text-color="black"
                  class="status-badge q-pa-sm text-weight-bold"
                >
                  <q-icon
                    :name="isPaid(transaction) ? 'check_circle' : 'pending'"
                    class="q-mr-xs"
                  />{{ isPaid(transaction) ? 'Lunas' : 'Belum Bayar' }}
                </q-badge>
              </div>
            </div>
          </q-card-section>

          <q-separator dark />
          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div
                v-for="info in transactionInfo(transaction)"
                :key="info.label"
                class="col-12 col-sm-6 col-lg-4"
              >
                <div class="info-block">
                  <q-icon :name="info.icon" color="amber-7" size="19px" />
                  <div class="info-content">
                    <span>{{ info.label }}</span>
                    <b v-if="!info.money" class="text-wrap">{{ info.value }}</b>
                    <b v-else :class="info.className"
                      ><FormatNumberComponen :model-value="info.value" prefix="Rp" display-only
                    /></b>
                  </div>
                </div>
              </div>
            </div>

            <div class="row justify-end q-mt-md">
              <div class="col-12 col-sm-7 col-md-5 col-lg-4">
                <div class="grand-total-panel">
                  <div class="grand-total-panel__icon">
                    <q-icon name="paid" size="30px" />
                  </div>
                  <div class="grand-total-panel__content">
                    <span>Grand Total</span>
                    <strong>
                      <FormatNumberComponen
                        :model-value="grandTotal(transaction)"
                        prefix="Rp"
                        display-only
                      />
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator dark />
          <q-expansion-item
            dark
            header-class="detail-expansion"
            expand-icon-class="text-amber"
            switch-toggle-side
          >
            <template #header>
              <q-item-section avatar
                ><q-icon name="restaurant_menu" color="amber"
              /></q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Detail Menu</q-item-label>
                <q-item-label caption class="text-grey-5"
                  >{{ details(transaction).length }} jenis menu ·
                  {{ itemCount(transaction) }} item</q-item-label
                >
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  dense
                  rounded
                  color="amber"
                  icon="visibility"
                  label="Detail"
                  no-caps
                  @click.stop="openDetail(transaction)"
                />
              </q-item-section>
            </template>

            <div class="menu-list q-px-md q-pb-md">
              <div v-if="!details(transaction).length" class="text-center text-grey-6 q-pa-md">
                Detail menu tidak tersedia
              </div>
              <div
                v-for="(item, itemIndex) in details(transaction)"
                :key="item.id || itemIndex"
                class="menu-item"
              >
                <div class="row q-col-gutter-sm items-center">
                  <div class="col-12 col-sm">
                    <div class="text-weight-bold text-wrap">{{ menuName(item) }}</div>
                    <div v-if="item.catatan" class="text-caption text-grey-6 text-wrap">
                      {{ item.catatan }}
                    </div>
                  </div>
                  <div class="col-4 col-sm-auto menu-stat">
                    <span>Jumlah</span><b>{{ itemQuantity(item) }}</b>
                  </div>
                  <div class="col-4 col-sm-auto menu-stat">
                    <span>Harga</span
                    ><b
                      ><FormatNumberComponen
                        :model-value="itemPrice(item)"
                        prefix="Rp"
                        display-only
                    /></b>
                  </div>
                  <div class="col-4 col-sm-auto menu-stat menu-stat--total">
                    <span>Subtotal</span
                    ><b
                      ><FormatNumberComponen
                        :model-value="itemSubtotal(item)"
                        prefix="Rp"
                        display-only
                    /></b>
                  </div>
                </div>
              </div>
            </div>
          </q-expansion-item>
        </q-card>
      </div>
    </q-card>

    <TransactionDetailDialog v-model="showDetail" :transaction="selectedTransaction" />
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import HederSatuComponen from 'src/components/HederSatuComponen.vue'
import FormatNumberComponen from 'src/components/FormatNumberComponen.vue'
import ReportSummaryCard from 'src/components/LaporanPenjualan/ReportSummaryCard.vue'
import SalesCharts from 'src/components/LaporanPenjualan/SalesCharts.vue'
import TransactionDetailDialog from 'src/components/LaporanPenjualan/TransactionDetailDialog.vue'
import { useLaporanPenjualanStore } from 'src/stores/laporanpenjualan'

const $q = useQuasar()
const store = useLaporanPenjualanStore()
const showDetail = ref(false)
const selectedTransaction = ref(null)

const paymentMethods = ['CASH', 'QRIS', 'TRANSFER']
const paymentStatuses = [
  { label: 'Lunas', value: '2' },
  { label: 'Belum Bayar', value: '1' },
]
const outletOptions = computed(() =>
  store.outlets.map((item) => ({ label: item.name || item.nama_angkringan, value: item.id })),
)
const summaryCards = computed(() => [
  {
    label: 'Total Transaksi',
    value: store.summary.totalTransactions.toLocaleString('id-ID'),
    icon: 'receipt_long',
    tone: 'amber',
    hint: 'Transaksi tercatat',
  },
  {
    label: 'Total Penjualan',
    value: formatCurrency(store.summary.totalSales),
    icon: 'payments',
    tone: 'green',
    hint: 'Omzet periode ini',
  },
  {
    label: 'Total Item Terjual',
    value: store.summary.totalItems.toLocaleString('id-ID'),
    icon: 'shopping_bag',
    tone: 'blue',
    hint: 'Menu berhasil terjual',
  },
  {
    label: 'Rata-rata Transaksi',
    value: formatCurrency(store.summary.averageTransaction),
    icon: 'monitoring',
    tone: 'purple',
    hint: 'Nilai per transaksi',
  },
])
const lastUpdatedLabel = computed(() =>
  new Date(store.lastUpdated).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
)

function details(row) {
  return row.rinci || row.items || row.details || []
}
function transactionNumber(row) {
  return row.no_transaksi || row.notrans || '-'
}
function transactionDate(row) {
  return row.tanggal_transaksi || row.tanggal || row.created_at || ''
}

function customerName(row) {
  return row.atasnama || row.customer_name || row.pelanggan?.name || row.customer?.name || '-'
}
function itemCount(row) {
  return details(row).reduce(
    (sum, item) => sum + Number(item.jumlah ?? item.qty ?? item.quantity ?? 0),
    0,
  )
}

function grandTotal(row) {
  return Number(row.grand_total ?? row.total_harga ?? row.total ?? row.subtotal ?? 0)
}

function paymentMethod(row) {
  return row.metode_bayar || row.payment_method || '-'
}
function paidAmount(row) {
  return Number(row.dibayar ?? row.uang_dibayar ?? row.paid_amount ?? row.bayar ?? 0)
}
function changeAmount(row) {
  return Number(row.kembalian ?? row.change ?? row.change_amount ?? 0)
}
function menuName(item) {
  return item.menu?.name || item.menu?.nama_menu || item.nama_menu || item.name || '-'
}
function itemQuantity(item) {
  return Number(item.jumlah ?? item.qty ?? item.quantity ?? 0)
}
function itemPrice(item) {
  return Number(item.harga_satuan ?? item.harga ?? item.price ?? 0)
}
function itemSubtotal(item) {
  return Number(item.subtotal ?? item.total ?? itemPrice(item) * itemQuantity(item))
}
function isPaid(row) {
  return String(row.flag) === '2' || String(row.status_pembayaran).toUpperCase() === 'LUNAS'
}
function transactionInfo(row) {
  return [
    { label: 'Pelanggan / Atas Nama', value: customerName(row), icon: 'badge' },
    {
      label: 'Jumlah Item',
      value: `${itemCount(row).toLocaleString('id-ID')} item`,
      icon: 'shopping_bag',
    },
    { label: 'Uang Dibayar', value: paidAmount(row), icon: 'payments', money: true },
    {
      label: 'Kembalian',
      value: changeAmount(row),
      icon: 'currency_exchange',
      money: true,
      className: 'text-green-4',
    },
  ]
}
function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
}
function formatDateTime(value) {
  return value
    ? new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
    : '-'
}
function validEndDate(date) {
  return date >= store.filters.dateFrom.replaceAll('-', '/')
}
function openDetail(row) {
  selectedTransaction.value = row
  showDetail.value = true
}
async function refreshReport() {
  await store.fetchReport()
}
function exportPdf() {
  try {
    store.exportPdf()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Gagal membuka dokumen PDF',
      position: 'top',
    })
  }
}

onMounted(async () => {
  await Promise.all([store.fetchOutlets(), store.fetchReport()])
})
</script>

<style scoped>
.report-page {
  min-height: 100%;
}
.surface-card {
  border: 1px solid rgba(255, 193, 7, 0.12);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
}
.filter-card :deep(.q-field--outlined .q-field__control:hover::before) {
  border-color: rgba(255, 193, 7, 0.5);
}
.filter-actions {
  min-height: 40px;
}
.transaction-section {
  min-height: 360px;
}
.transaction-card,
.transaction-skeleton {
  width: 100%;
  min-width: 0;
  border: 1px solid rgba(255, 193, 7, 0.11);
  border-radius: 16px;
  overflow: hidden;
}
.transaction-card {
  opacity: 0;
  animation: card-enter 0.45s cubic-bezier(0.16, 1, 0.3, 1) var(--delay) forwards;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}
.transaction-card:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 193, 7, 0.32);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.32);
}
.transaction-header {
  background: linear-gradient(120deg, rgba(255, 193, 7, 0.07), transparent 52%);
}
.transaction-number {
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 16px;
}
.payment-badge,
.status-badge {
  max-width: 100%;
  white-space: normal;
}
.info-block {
  display: flex;
  min-width: 0;
  height: 100%;
  gap: 10px;
  padding: 11px 12px;
  border: 1px solid rgba(255, 255, 255, 0.055);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.022);
}
.info-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
}
.info-content span,
.menu-stat span {
  color: #757575;
  font-size: 11px;
}
.info-content b {
  overflow-wrap: anywhere;
  font-size: 13px;
}
.grand-total-panel {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 193, 7, 0.48);
  border-radius: 18px;
  color: #171717;
  background: linear-gradient(135deg, rgba(255, 213, 79, 0.94), rgba(255, 193, 7, 0.82));
  box-shadow: 0 8px 22px rgba(255, 193, 7, 0.14);
  transition:
    transform 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
}
.grand-total-panel:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, rgba(255, 224, 130, 0.98), rgba(255, 202, 40, 0.9));
  box-shadow: 0 11px 28px rgba(255, 193, 7, 0.23);
}
.grand-total-panel__icon {
  width: 48px;
  height: 48px;
  display: grid;
  flex: 0 0 48px;
  place-items: center;
  border-radius: 15px;
  background: rgba(0, 0, 0, 0.1);
}
.grand-total-panel__content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-end;
}
.grand-total-panel__content span {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}
.grand-total-panel__content strong {
  max-width: 100%;
  overflow-wrap: anywhere;
  font-size: clamp(22px, 2.2vw, 29px);
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -0.5px;
}
.detail-expansion {
  min-height: 62px;
}
.menu-list {
  background: rgba(0, 0, 0, 0.16);
}
.menu-item {
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.055);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
}
.menu-item + .menu-item {
  margin-top: 8px;
}
.menu-stat {
  display: flex;
  min-width: 96px;
  flex-direction: column;
}
.menu-stat b {
  overflow-wrap: anywhere;
  font-size: 12px;
}
.menu-stat--total b {
  color: #ffc107;
}
.empty-icon {
  width: 104px;
  height: 104px;
  display: grid;
  place-items: center;
  border: 1px dashed rgba(255, 193, 7, 0.2);
  border-radius: 50%;
  background: rgba(255, 193, 7, 0.035);
}
.empty-state,
.error-state {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.animate-enter {
  opacity: 0;
  animation: enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-enter--delay-1 {
  animation-delay: 0.07s;
}
.animate-enter--delay-2 {
  animation-delay: 0.14s;
}
.animate-enter--delay-3 {
  animation-delay: 0.21s;
}
@keyframes enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (max-width: 600px) {
  .report-page {
    padding: 12px;
  }
  .filter-actions {
    justify-content: stretch;
  }
  .filter-actions .q-btn {
    flex: 1;
  }
  .transaction-list {
    padding: 10px;
  }
  .transaction-card :deep(.q-item__section--side) {
    padding-left: 4px;
  }
  .transaction-card :deep(.q-item__section--side .q-btn .q-btn__content span) {
    display: none;
  }
  .menu-stat {
    min-width: 0;
  }
  .grand-total-panel {
    width: 100%;
    justify-content: space-between;
  }
  .grand-total-panel__content {
    align-items: flex-end;
  }
}
</style>
