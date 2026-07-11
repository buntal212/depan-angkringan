<template>
  <q-page class="q-pa-md bg-black">
    <!-- Header Welcome -->
    <div class="apple-dashboard-header q-mb-xl q-mt-md animate-fade-in-up">
      <q-icon name="local_cafe" class="apple-dashboard-header__icon" />

      <div class="apple-dashboard-header__content">
        <div class="apple-dashboard-header__greeting">Selamat datang 👋</div>

        <div class="apple-dashboard-header__name">
          {{ namauser }}
        </div>

        <div class="apple-dashboard-header__description">
          Kelola menu, transaksi, dan pantau perkembangan
          <span>SI-NANGKRING</span> hari ini.
        </div>
      </div>

      <div class="apple-dashboard-header__line">
        <span></span>
      </div>
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
import { onMounted, ref } from 'vue'
import { useMenuStore } from 'src/stores/menus'

const menuStore = useMenuStore()
const namauser = ref(null)
onMounted(() => {
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
  const userId = Number(userData.id || 0)
  namauser.value = ref(userData.name)
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

.apple-dashboard-header {
  position: relative;
  overflow: hidden;
  padding: 18px 0 22px;
}

.apple-dashboard-header__content {
  position: relative;
  z-index: 2;
}

.apple-dashboard-header__greeting {
  margin-bottom: 4px;
  color: #ffc107;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.apple-dashboard-header__name {
  color: #ffffff;
  font-size: clamp(34px, 6vw, 58px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1.5px;
}

.apple-dashboard-header__description {
  max-width: 560px;
  margin-top: 12px;
  color: #9e9e9e;
  font-size: 15px;
  line-height: 1.7;
}

.apple-dashboard-header__description span {
  color: #ffffff;
  font-weight: 700;
}

.apple-dashboard-header__icon {
  position: absolute;
  top: -20px;
  right: 10px;
  color: #ffc107;
  font-size: 150px;
  opacity: 0.07;
  transform: rotate(-10deg);
  pointer-events: none;
}

.apple-dashboard-header__line {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 1px;
  margin-top: 24px;
  background: rgba(255, 255, 255, 0.08);
}

.apple-dashboard-header__line span {
  display: block;
  width: 90px;
  height: 2px;
  background: #ffc107;
  border-radius: 99px;
}

@media (max-width: 600px) {
  .apple-dashboard-header {
    padding-top: 10px;
  }

  .apple-dashboard-header__name {
    font-size: 38px;
  }

  .apple-dashboard-header__icon {
    top: 0;
    right: -20px;
    font-size: 110px;
  }

  .apple-dashboard-header__description {
    max-width: 80%;
    font-size: 14px;
  }
}
</style>
