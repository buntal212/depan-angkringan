<template>
  <q-dialog
    :model-value="modelValue"
    transition-show="scale"
    transition-hide="scale"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="detail-dialog bg-dark text-white">
      <q-card-section class="detail-header row items-start no-wrap">
        <div class="detail-icon flex flex-center"><q-icon name="receipt_long" size="28px" /></div>
        <div class="q-ml-md">
          <div class="text-h6 text-amber text-weight-bold">Detail Transaksi</div>
          <div class="text-caption text-grey-5">{{ transaction?.no_transaksi || '-' }}</div>
        </div>
        <q-space />
        <q-btn v-close-popup flat round dense icon="close" color="grey-5" />
      </q-card-section>
      <q-separator dark />

      <q-card-section class="q-pa-md">
        <div class="info-grid q-mb-md">
          <div v-for="info in transactionInfo" :key="info.label" class="info-item">
            <q-icon :name="info.icon" color="amber-7" size="18px" />
            <div>
              <span>{{ info.label }}</span
              ><b>{{ info.value }}</b>
            </div>
          </div>
        </div>

        <div class="text-subtitle2 text-weight-bold q-mb-sm">Daftar Menu</div>
        <div class="items-box">
          <div class="item-head row no-wrap text-caption text-grey-6">
            <div class="col">Menu</div>
            <div class="qty-col text-center">Jumlah</div>
            <div class="price-col text-right">Harga</div>
            <div class="subtotal-col text-right">Subtotal</div>
          </div>
          <div
            v-for="(item, index) in items"
            :key="item.id || index"
            class="item-row row items-center no-wrap"
          >
            <div class="col text-weight-medium ellipsis">
              {{ item.menu?.name || item.menu?.nama_menu || item.nama_menu || '-' }}
            </div>
            <div class="qty-col text-center">
              {{ item.jumlah ?? item.qty ?? item.quantity ?? 0 }}
            </div>
            <div class="price-col text-right text-grey-5">
              {{ formatCurrency(item.harga_satuan ?? item.harga ?? item.price) }}
            </div>
            <div class="subtotal-col text-right text-amber text-weight-bold">
              {{ formatCurrency(item.subtotal) }}
            </div>
          </div>
          <div v-if="!items.length" class="q-pa-lg text-center text-grey-6">
            Detail menu tidak tersedia
          </div>
        </div>
      </q-card-section>

      <q-separator dark />
      <q-card-section class="total-section">
        <div class="row items-center">
          <div>
            <div class="text-caption text-grey-5">Total Pembayaran</div>
            <div class="text-h5 text-amber text-weight-bold">{{ formatCurrency(total) }}</div>
          </div>
          <q-space /><q-badge
            :color="isPaid ? 'green-5' : 'red-5'"
            text-color="black"
            class="text-weight-bold q-pa-sm"
            >{{ isPaid ? 'Lunas' : 'Belum Bayar' }}</q-badge
          >
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  transaction: { type: Object, default: null },
})
defineEmits(['update:modelValue'])

const items = computed(
  () => props.transaction?.rinci || props.transaction?.items || props.transaction?.details || [],
)
const total = computed(() =>
  Number(
    props.transaction?.grand_total ??
      props.transaction?.total_harga ??
      props.transaction?.total ??
      0,
  ),
)
const isPaid = computed(
  () =>
    String(props.transaction?.flag) === '2' ||
    String(props.transaction?.status_pembayaran).toUpperCase() === 'LUNAS',
)
const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`
const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'
const transactionInfo = computed(() => [
  {
    label: 'Tanggal',
    value: formatDateTime(
      props.transaction?.tanggal_transaksi ||
        props.transaction?.tanggal ||
        props.transaction?.created_at,
    ),
    icon: 'event',
  },
  {
    label: 'Metode Pembayaran',
    value: props.transaction?.metode_bayar || props.transaction?.payment_method || '-',
    icon: 'payments',
  },
])
</script>

<style scoped>
.detail-dialog {
  width: min(760px, 95vw);
  max-width: 760px;
  border: 1px solid rgba(255, 193, 7, 0.18);
  border-radius: 20px;
  overflow: hidden;
}
.detail-header {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.09), transparent 55%);
}
.detail-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  color: #ffc107;
  background: rgba(255, 193, 7, 0.1);
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.info-item {
  display: flex;
  gap: 10px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
}
.info-item div {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.info-item span {
  color: #757575;
  font-size: 11px;
}
.info-item b {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}
.items-box {
  max-height: 300px;
  overflow: auto;
  border: 1px solid rgba(255, 193, 7, 0.1);
  border-radius: 14px;
}
.item-head,
.item-row {
  padding: 11px 14px;
}
.item-head {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #242424;
}
.item-row {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 13px;
}
.qty-col {
  width: 68px;
}
.price-col {
  width: 120px;
}
.subtotal-col {
  width: 130px;
}
.total-section {
  background: rgba(255, 193, 7, 0.035);
}
@media (max-width: 600px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  .detail-dialog {
    width: 100vw;
    max-height: 92vh;
    border-radius: 20px 20px 0 0;
  }
  .price-col {
    display: none;
  }
  .subtotal-col {
    width: 105px;
  }
  .item-head,
  .item-row {
    padding-inline: 10px;
  }
}
</style>
