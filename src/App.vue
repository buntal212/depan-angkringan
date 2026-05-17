<template>
  <router-view />

  <!-- <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 320px; border-radius: 16px">
      <q-card-section class="row items-center q-pb-none">
        <q-icon name="install_mobile" color="primary" size="32px" class="q-mr-sm" />

        <div class="text-h6">Install Aplikasi</div>
      </q-card-section>

      <q-card-section> Tambahkan aplikasi SI-NANGKRING ke Home Screen. </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Nanti" color="grey" v-close-popup />

        <q-btn label="Install" color="primary" unelevated @click="installApp" />
      </q-card-actions>
    </q-card>
  </q-dialog> -->
</template>

<script setup>
// import { ref, watch } from 'vue'

// import { deferredPrompt, canInstall } from 'src/boot/a2hs'

// const showDialog = ref(false)

// watch(canInstall, (val) => {
//   console.log('WATCH:', val)

//   if (val) {
//     showDialog.value = true
//   }
// })

// const installApp = async () => {
//   if (!deferredPrompt.value) return

//   showDialog.value = false

//   deferredPrompt.value.prompt()

//   const result = await deferredPrompt.value.userChoice

//   console.log(result)

//   deferredPrompt.value = null
//   canInstall.value = false
// }
</script>
