<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-lg-8">
      <q-card class="chart-card bg-dark text-white">
        <q-card-section class="row items-center">
          <div>
            <div class="text-subtitle1 text-weight-bold">Grafik Harian</div>
            <div class="text-caption text-grey-5">Tren penjualan pada periode terpilih</div>
          </div>
          <q-space />
          <q-icon name="show_chart" color="amber" size="md" />
        </q-card-section>
        <q-separator dark />
        <q-card-section>
          <q-skeleton v-if="loading" height="220px" square />
          <div v-else-if="dailyData.length" class="bar-chart">
            <div v-for="point in visibleDailyData" :key="point.date" class="bar-column">
              <q-tooltip
                >Rp {{ formatNumber(point.value) }} · {{ formatShortDate(point.date) }}</q-tooltip
              >
              <div class="bar-value">{{ compactNumber(point.value) }}</div>
              <div class="bar-track">
                <div class="bar-fill" :style="{ height: `${barHeight(point.value)}%` }"></div>
              </div>
              <div class="bar-label">{{ formatShortDate(point.date) }}</div>
            </div>
          </div>
          <div v-else class="chart-empty">
            <q-icon name="insert_chart_outlined" size="48px" color="grey-8" /><span
              >Belum ada data grafik</span
            >
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-lg-4">
      <q-card class="chart-card bg-dark text-white">
        <q-card-section class="row items-center">
          <div>
            <div class="text-subtitle1 text-weight-bold">Metode Pembayaran</div>
            <div class="text-caption text-grey-5">Kontribusi berdasarkan nilai</div>
          </div>
          <q-space />
          <q-icon name="donut_large" color="amber" size="md" />
        </q-card-section>
        <q-separator dark />
        <q-card-section>
          <q-skeleton v-if="loading" height="220px" square />
          <div v-else-if="paymentData.length" class="payment-chart">
            <div class="donut" :style="donutStyle">
              <div>
                <b>{{ paymentData.length }}</b
                ><span>Metode</span>
              </div>
            </div>
            <div class="payment-legend">
              <div v-for="(item, index) in paymentData" :key="item.label" class="legend-row">
                <span
                  class="legend-dot"
                  :style="{ background: colors[index % colors.length] }"
                ></span>
                <span class="col ellipsis">{{ item.label }}</span>
                <b>{{ percentage(item.value) }}%</b>
              </div>
            </div>
          </div>
          <div v-else class="chart-empty">
            <q-icon name="donut_large" size="48px" color="grey-8" /><span
              >Belum ada data pembayaran</span
            >
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  dailyData: { type: Array, default: () => [] },
  paymentData: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const colors = ['#ffc107', '#42a5f5', '#66bb6a', '#ab47bc', '#ef5350']
const visibleDailyData = computed(() => props.dailyData.slice(-14))
const maxDailyValue = computed(() =>
  Math.max(...visibleDailyData.value.map((item) => item.value), 1),
)
const paymentTotal = computed(() => props.paymentData.reduce((sum, item) => sum + item.value, 0))
const barHeight = (value) => Math.max((value / maxDailyValue.value) * 100, 4)
const percentage = (value) =>
  paymentTotal.value ? Math.round((value / paymentTotal.value) * 100) : 0
const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')
const compactNumber = (value) =>
  new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
const formatShortDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
const donutStyle = computed(() => {
  let start = 0
  const stops = props.paymentData.map((item, index) => {
    const end = start + percentage(item.value)
    const segment = `${colors[index % colors.length]} ${start}% ${end}%`
    start = end
    return segment
  })
  return { background: `conic-gradient(${stops.join(', ')})` }
})
</script>

<style scoped>
.chart-card {
  height: 100%;
  min-height: 330px;
  border: 1px solid rgba(255, 193, 7, 0.12);
  border-radius: 16px;
  overflow: hidden;
}
.bar-chart {
  height: 220px;
  display: flex;
  align-items: stretch;
  gap: 8px;
  overflow-x: auto;
  padding: 12px 4px 0;
}
.bar-column {
  min-width: 42px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bar-value {
  height: 22px;
  color: #9e9e9e;
  font-size: 10px;
}
.bar-track {
  width: 70%;
  flex: 1;
  display: flex;
  align-items: flex-end;
  border-radius: 8px 8px 3px 3px;
  background: rgba(255, 255, 255, 0.035);
  overflow: hidden;
}
.bar-fill {
  width: 100%;
  min-height: 4px;
  border-radius: 8px 8px 3px 3px;
  background: linear-gradient(180deg, #ffd54f, #ffb300);
  box-shadow: 0 0 12px rgba(255, 193, 7, 0.2);
  transition: height 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}
.bar-label {
  margin-top: 8px;
  color: #757575;
  font-size: 10px;
  white-space: nowrap;
}
.payment-chart {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
}
.donut {
  width: 132px;
  height: 132px;
  flex: 0 0 132px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  position: relative;
}
.donut::after {
  content: '';
  position: absolute;
  inset: 22px;
  border-radius: 50%;
  background: #1d1d1d;
}
.donut div {
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.donut b {
  font-size: 24px;
}
.donut span {
  color: #9e9e9e;
  font-size: 11px;
}
.payment-legend {
  min-width: 130px;
  flex: 1;
}
.legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  color: #bdbdbd;
  font-size: 12px;
}
.legend-row b {
  color: #fff;
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: 0 0 8px;
}
.chart-empty {
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #616161;
}
@media (max-width: 500px) {
  .payment-chart {
    flex-direction: column;
    gap: 14px;
  }
  .payment-legend {
    width: 100%;
  }
  .bar-column {
    min-width: 38px;
  }
}
</style>
