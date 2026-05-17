<template>
  <q-page class="flex flex-center bg-black" style="min-height: 100vh">
    <q-card class="q-pa-lg login-card bg-dark text-white animate-fade-in-up" bordered>
      <q-card-section class="text-center q-pb-none">
        <div class="text-h4 text-weight-bolder text-amber q-mb-sm tracking-wide animate-pop-in">
          DAFTAR AKUN
        </div>
        <div class="text-subtitle1 text-grey-5 animate-fade-in delay-1">
          Bergabunglah dengan Kami
        </div>
      </q-card-section>

      <q-card-section class="q-pt-lg">
        <q-form @submit="onSubmit" class="q-gutter-y-md">
          <q-input
            dark
            outlined
            color="amber"
            v-model="name"
            label="Nama Angkringan"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Nama tidak boleh kosong']"
            class="text-body1 animate-slide-in-right delay-2"
          >
            <template v-slot:prepend>
              <q-icon name="badge" color="amber" />
            </template>
          </q-input>

          <q-input
            dark
            outlined
            color="amber"
            v-model="username"
            label="Username"
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
            v-model="email"
            label="Email"
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
            v-model="lokasi"
            label="Lokasi"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Lokasi tidak boleh kosong']"
            class="text-body1 animate-slide-in-right delay-2"
          >
            <template v-slot:prepend>
              <q-icon name="place" color="amber" />
            </template>
          </q-input>

          <q-input
            dark
            outlined
            color="amber"
            v-model="owner"
            label="Nama Owner"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Owner tidak boleh kosong']"
            class="text-body1 animate-slide-in-right delay-2"
          >
            <template v-slot:prepend>
              <q-icon name="person_outline" color="amber" />
            </template>
          </q-input>

          <q-input
            dark
            outlined
            color="amber"
            v-model="noTelpon"
            label="No Telpon"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'No Telpon tidak boleh kosong']"
            class="text-body1 animate-slide-in-right delay-2"
          >
            <template v-slot:prepend>
              <q-icon name="phone" color="amber" />
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

          <q-input
            dark
            outlined
            color="amber"
            :type="isPwdConfirm ? 'password' : 'text'"
            v-model="passwordConfirm"
            label="Konfirmasi Password"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Konfirmasi password tidak boleh kosong',
              (val) => val === password || 'Password tidak sama',
            ]"
            class="text-body1 animate-slide-in-right delay-3"
          >
            <template v-slot:prepend>
              <q-icon name="lock_clock" color="amber" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="isPwdConfirm ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwdConfirm = !isPwdConfirm"
                color="amber"
              />
            </template>
          </q-input>

          <div class="q-pt-md animate-fade-in-up delay-4">
            <q-btn
              label="Daftar"
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

          <div class="text-center q-mt-lg animate-fade-in delay-5 flex column">
            <div class="text-grey-5 q-mt-sm">
              Sudah punya akun?
              <router-link
                to="/login"
                class="text-amber text-weight-bold text-decoration-none hover-glow"
                style="margin-left: 4px"
                >Masuk di sini</router-link
              >
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { notifySuccess, notifyError } from 'src/utils/notify'

const name = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const lokasi = ref('')
const owner = ref('')
const noTelpon = ref('')
const isPwd = ref(true)
const isPwdConfirm = ref(true)
const loading = ref(false)

const router = useRouter()

const onSubmit = async () => {
  loading.value = true

  const payload = {
    name: name.value,
    username: username.value,
    email: email.value,
    password: password.value,
    password_confirmation: passwordConfirm.value,
    lokasi: lokasi.value,
    owner: owner.value,
    no_telpon: noTelpon.value,
  }

  try {
    // Menghapus 'const response =' karena kita tidak membutuhkan datanya saat ini (ini yang bikin garis merah)
    await api.post('/register', payload)

    // axios throws an error if status code is not 2xx, so if we reach here, it's successful
    notifySuccess('Pendaftaran berhasil! Silahkan login.')
    router.push('/login')
  } catch (error) {
    console.error('Error register:', error)

    let errorMessage = 'Terjadi kesalahan saat menghubungi server.'

    if (error.response && error.response.data) {
      // Laravel validation error (422) — errors ada di response.data.errors
      if (error.response.data.errors) {
        const errors = error.response.data.errors
        // Ambil pesan error pertama dari setiap field
        errorMessage = Object.values(errors)
          .map((fieldErrors) => fieldErrors[0])
          .join('\n')
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message
      }
    }

    notifyError(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
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
