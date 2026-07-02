<template>
  <div class="fit">
    <ListPenjualanPage v-if="isList" @add="onAdd" @edit="onEdit" @back="back" />

    <FormPage v-else @back="onBack" />
  </div>
</template>

<script setup>
import { usePenjualanStore } from 'src/stores/penjualan.js'
import { defineAsyncComponent, onMounted, ref } from 'vue'
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

const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
const userId = Number(userData.id || 0)

onMounted(async () => {
  store.form.kode_angkringan = userId
})
</script>

<style scoped></style>
