<template>
  <q-card class="report-summary-card bg-dark text-white">
    <q-card-section class="row items-center no-wrap q-pa-md">
      <div class="summary-icon flex flex-center" :class="`summary-icon--${tone}`">
        <q-icon :name="icon" size="26px" />
      </div>
      <div class="q-ml-md col">
        <div class="text-caption text-grey-5">{{ label }}</div>
        <q-skeleton v-if="loading" type="text" width="70%" class="q-mt-xs" />
        <div v-else class="summary-value ellipsis">{{ value }}</div>
        <div class="text-caption text-grey-6 q-mt-xs">{{ hint }}</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  hint: { type: String, default: 'Periode terpilih' },
  icon: { type: String, required: true },
  tone: { type: String, default: 'amber' },
  loading: { type: Boolean, default: false },
})
</script>

<style scoped>
.report-summary-card {
  height: 100%;
  border: 1px solid rgba(255, 193, 7, 0.12);
  border-radius: 16px;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}
.report-summary-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 193, 7, 0.4);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
}
.summary-icon {
  width: 52px;
  height: 52px;
  flex: 0 0 52px;
  border-radius: 15px;
  color: #ffc107;
  background: rgba(255, 193, 7, 0.1);
}
.summary-icon--green {
  color: #66bb6a;
  background: rgba(102, 187, 106, 0.12);
}
.summary-icon--blue {
  color: #42a5f5;
  background: rgba(66, 165, 245, 0.12);
}
.summary-icon--purple {
  color: #ab47bc;
  background: rgba(171, 71, 188, 0.12);
}
.summary-value {
  margin-top: 2px;
  color: #fff;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.4px;
}
</style>
