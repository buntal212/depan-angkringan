<template>
  <div class="fit">
    <ListPenjualanPage v-if="isList" @add="onAdd" @edit="onEdit" @back="back" />

    <FormPage v-else @back="onBack" />
  </div>
</template>

<script setup>
import { usePenjualanStore } from 'src/stores/penjualan.js'
import { defineAsyncComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
const ListPenjualanPage = defineAsyncComponent(() => import('./comp/ListPenjualanPage.vue'))
const FormPage = defineAsyncComponent(() => import('./comp/FormPage.vue'))

const isList = ref(true)
const store = usePenjualanStore()
const router = useRouter()
function onAdd() {
  store.resetForm()
  isList.value = false
}

function onEdit(data) {
  store.setEditForm(data)
  isList.value = false
}

function onBack() {
  isList.value = true
  store.getListPenjualan()
}

function back() {
  router.push('/')
}
</script>

<style scoped></style>
