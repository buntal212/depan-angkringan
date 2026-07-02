<template>
  <q-page class="q-pa-md bg-black">
    <!-- Header Welcome -->
    <div class="q-mb-xl q-mt-md animate-fade-in-up">
      <div class="text-h5 text-white text-weight-bold">Halo, Admin! 👋</div>
      <div class="text-subtitle2 text-grey-5">Selamat datang di Dashboard SI-NANGKRING</div>
    </div>

    <!-- Grid Menu -->
    <div class="row q-col-gutter-md">
      <div
        class="col-6 col-md-4 col-lg-3"
        v-for="(menu, index) in menuStore.menus"
        :key="menu.label"
      >
        <q-card
          class="menu-card bg-dark text-white cursor-pointer q-hoverable animate-pop-in flex flex-center"
          :style="{ 'animation-delay': `${index * 0.05}s` }"
          v-ripple
          @click="$router.push(menu.route)"
        >
          <span class="q-focus-helper"></span>
          <q-card-section class="flex flex-center column q-pa-lg text-center" style="width: 100%">
            <q-icon :name="menu.icon" size="3.5rem" color="amber" class="q-mb-md glow-icon" />
            <div class="text-weight-bold text-subtitle1" style="line-height: 1.2">
              {{ menu.label }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Full Screen Loading Overlay -->
    <div v-if="menuStore.loading" class="fullscreen flex flex-center z-max loading-overlay">
      <div class="text-center animate-fade-in">
        <q-spinner-puff color="amber" size="8rem" class="q-mb-lg glow-spinner" />
        <div class="text-h5 text-amber text-weight-bolder animate-pulse tracking-wide glow-text">
          MEMPERSIAPKAN DATA...
        </div>
        <div class="text-subtitle1 text-grey-4 q-mt-sm">Memuat Menu Angkringan Spesial Untukmu</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useMenuStore } from 'src/stores/menus'

const menuStore = useMenuStore()

onMounted(() => {
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
  const userId = Number(userData.id || 0)
  menuStore.user = userId
  if (menuStore.menus.length === 0) {
    menuStore.getMenus()
  }
})
</script>

<style scoped>
.menu-card {
  border-radius: 16px;
  border: 1px solid rgba(255, 193, 7, 0.1);
  transition: all 0.3s ease;
  height: 140px;
}

.menu-card:hover {
  border-color: rgba(255, 193, 7, 0.5);
  transform: translateY(-5px);
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.6),
    0 0 15px rgba(255, 193, 7, 0.15);
}

.glow-icon {
  transition: all 0.3s ease;
}

.menu-card:hover .glow-icon {
  text-shadow: 0 0 15px rgba(255, 193, 7, 0.8);
  transform: scale(1.1);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-pop-in {
  opacity: 0;
  animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.loading-overlay {
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(12px);
  transition: all 0.5s ease;
}

.glow-spinner {
  filter: drop-shadow(0 0 20px rgba(255, 193, 7, 0.9));
}

.glow-text {
  text-shadow: 0 0 15px rgba(255, 193, 7, 0.8);
}

.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.8;
    transform: scale(0.98);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
    text-shadow: 0 0 20px rgba(255, 193, 7, 1);
  }
  100% {
    opacity: 0.8;
    transform: scale(0.98);
  }
}
</style>
