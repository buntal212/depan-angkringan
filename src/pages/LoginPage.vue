<template>
  <q-page class="flex flex-center bg-black" style="min-height: 100vh">
    <q-card class="q-pa-lg login-card bg-dark text-white animate-fade-in-up" bordered>
      <q-card-section class="text-center q-pb-none">
        <div class="text-h3 text-weight-bolder text-amber q-mb-sm tracking-wide animate-pop-in">
          ANGKRINGAN
        </div>
        <div class="text-subtitle1 text-grey-5 animate-fade-in delay-1">
          Nongkrong & Nikmati Malam
        </div>
      </q-card-section>

      <q-card-section class="q-pt-xl">
        <q-form @submit="onSubmit" class="q-gutter-y-md">
          <q-input
            dark
            outlined
            color="amber"
            v-model="username"
            label="Username atau Email"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Username tidak boleh kosong']"
            class="text-body1 animate-slide-in-right delay-2"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="amber" />
            </template>
          </q-input>

          <q-input
            dark
            outlined
            color="amber"
            :type="isPwd ? 'password' : 'text'"
            v-model="password"
            label="Password"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Password tidak boleh kosong']"
            class="text-body1 animate-slide-in-right delay-3"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="amber" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
                color="amber"
              />
            </template>
          </q-input>

          <div class="q-pt-md animate-fade-in-up delay-4">
            <q-btn
              label="Masuk"
              type="submit"
              color="amber"
              text-color="black"
              size="lg"
              class="full-width text-weight-bold glowing-btn"
              rounded
              unelevated
              :loading="loading"
            >
              <template v-slot:loading>
                <q-spinner-facebook />
              </template>
            </q-btn>
          </div>
          <div>
            <q-btn v-if="canInstall" label="INSTALL APP" color="primary" @click="installApp" />
          </div>

          <div class="text-center q-mt-lg animate-fade-in delay-5 flex column">
            <a href="#" class="text-amber text-decoration-none hover-glow">Lupa Password?</a>
            <div class="text-grey-5 q-mt-md">
              Belum punya akun?
              <router-link
                to="/register"
                class="text-amber text-weight-bold text-decoration-none hover-glow"
                style="margin-left: 4px"
                >Daftar di sini</router-link
              >
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Full Screen Loading Overlay -->
    <div v-if="successLoading" class="fullscreen flex flex-center z-max loading-overlay">
      <div class="text-center animate-fade-in">
        <q-spinner-puff color="amber" size="8rem" class="q-mb-lg glow-spinner" />
        <div class="text-h5 text-amber text-weight-bolder animate-pulse tracking-wide glow-text">
          MEMPERSIAPKAN DATA...
        </div>
        <div class="text-subtitle1 text-grey-4 q-mt-sm">Memuat Menu Angkringan Spesial Untukmu</div>
      </div>
    </div>
  </q-page>
  <q-dialog v-model="showDialog" persistent>
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
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { notifySuccess, notifyError } from 'src/utils/notify'
import { useMenuStore } from 'src/stores/menus'
import { canInstall, deferredPrompt } from 'src/boot/a2hs'

const username = ref('')
const password = ref('')
const isPwd = ref(true)
const loading = ref(false)
const successLoading = ref(false)

const router = useRouter()

const showDialog = ref(false)

watch(canInstall, (val) => {
  // console.log('WATCH:', val)

  if (val) {
    showDialog.value = true
  }
})

const installApp = async () => {
  if (!deferredPrompt.value) return

  showDialog.value = false

  deferredPrompt.value.prompt()

  const result = await deferredPrompt.value.userChoice

  console.log(result)

  deferredPrompt.value = null
  canInstall.value = false
}

const onSubmit = async () => {
  loading.value = true

  const payload = {
    username: username.value, // Diasumsikan backend menerima email
    password: password.value,
  }

  try {
    const response = await api.post('/login', payload)

    // Simpan token jika dikembalikan dari backend
    if (response.data && response.data.access_token) {
      const token = response.data.access_token

      localStorage.setItem('auth_token', token)

      if (response.data.user) {
        localStorage.setItem('user_data', JSON.stringify(response.data.user))
      }

      // 🔥 WAJIB
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    // Call store getMenus after successful login
    successLoading.value = true
    const menuStore = useMenuStore()
    const user = JSON.parse(localStorage.getItem('user_data'))
    menuStore.user = user.id

    // Delay estetik agar loading screen terlihat menarik
    await new Promise((resolve) => setTimeout(resolve, 1500))
    await menuStore.getMenus()

    notifySuccess('Login berhasil! Selamat datang.')
    router.push('/')
  } catch (error) {
    successLoading.value = false
    console.error('Error login:', error)

    let errorMessage = 'Terjadi kesalahan saat menghubungi server.'
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message
    } else if (error.response && error.response.status === 401) {
      errorMessage = 'Username/Email atau Password salah.'
    }

    notifyError(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
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

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 24px;
  border: 1px solid rgba(255, 193, 7, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.tracking-wide {
  letter-spacing: 2px;
}

.glowing-btn {
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
}

.glowing-btn:hover {
  box-shadow: 0 6px 20px rgba(255, 193, 7, 0.6);
  transform: translateY(-2px);
}

.hover-glow {
  transition: all 0.3s ease;
}

.hover-glow:hover {
  text-shadow: 0 0 8px rgba(255, 193, 7, 0.8);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  80% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-pop-in {
  opacity: 0;
  animation: popIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: 0.2s;
}

.animate-slide-in-right {
  opacity: 0;
  animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in {
  opacity: 0;
  animation: fadeIn 0.8s ease forwards;
}

/* Delays for staggered effect */
.delay-1 {
  animation-delay: 0.3s;
}
.delay-2 {
  animation-delay: 0.4s;
}
.delay-3 {
  animation-delay: 0.5s;
}
.delay-4 {
  animation-delay: 0.6s;
}
.delay-5 {
  animation-delay: 0.7s;
}
</style>
