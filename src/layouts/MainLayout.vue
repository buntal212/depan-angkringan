<template>
  <q-layout view="hHh lpR fFf" class="bg-black">
    <q-header class="bg-dark text-amber" elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="text-weight-bolder tracking-wide"> SI-NANGKRING </q-toolbar-title>
        <q-btn flat dense round icon="account_circle" @click="$router.push('/login')" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      class="bg-dark text-white"
      :width="280"
      bordered
      style="border-color: rgba(255, 193, 7, 0.2)"
    >
      <div class="q-pa-md text-center q-pb-lg">
        <q-avatar size="80px" class="q-mb-sm shadow-5">
          <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
        </q-avatar>
        <div class="text-weight-bold text-amber text-h6">Admin Angkringan</div>
        <div class="text-caption text-grey-5">admin@angkringan.id</div>
      </div>
      <q-separator dark />
      <q-list class="q-mt-sm">
        <q-item clickable v-ripple class="text-red-4" @click="$router.push('/login')">
          <q-item-section avatar>
            <q-icon name="logout" color="red-4" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold">Logout</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped>
.tracking-wide {
  letter-spacing: 2px;
}
.hover-amber:hover {
  color: #ffc107 !important;
  background: rgba(255, 193, 7, 0.1);
}
</style>
