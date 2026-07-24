<template>
  <q-page class="profile-page q-pa-md q-pa-md-lg">
    <div class="profile-container">
      <div class="row items-center q-mb-lg">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          color="amber"
          aria-label="Kembali"
          @click="router.push('/')"
        />
        <div class="q-ml-md">
          <div class="text-h5 text-weight-bold text-white">Profil Angkringan</div>
          <div class="text-caption text-grey-5">Informasi akun dan identitas angkringan</div>
        </div>
      </div>

      <q-card class="profile-hero text-white">
        <q-card-section class="profile-hero__content">
          <div class="row items-center q-col-gutter-lg">
            <div class="col-12 col-sm-auto text-center">
              <q-avatar size="104px" class="profile-avatar">
                <q-icon name="storefront" size="56px" color="amber" />
              </q-avatar>
            </div>

            <div class="col-12 col-sm text-center text-sm-left">
              <div class="row items-center justify-center justify-sm-start q-gutter-sm">
                <div class="text-h4 text-weight-bolder">{{ profile.name }}</div>
                <q-badge
                  rounded
                  :color="profile.isActive ? 'positive' : 'negative'"
                  :label="profile.isActive ? 'Aktif' : 'Nonaktif'"
                  class="status-badge"
                />
              </div>
              <div class="text-subtitle1 text-amber q-mt-xs">{{ profile.owner }}</div>
              <div class="text-body2 text-grey-4 q-mt-sm">
                <q-icon name="place" color="amber" class="q-mr-xs" />
                {{ profile.location }}
              </div>
            </div>

            <div class="col-12 col-sm-auto">
              <div class="member-box text-center">
                <q-icon name="verified" size="28px" color="amber" />
                <div class="text-caption text-grey-5 q-mt-xs">ID Angkringan</div>
                <div class="text-subtitle1 text-weight-bold">{{ profile.id }}</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-12 col-md-7">
          <q-card class="info-card full-height">
            <q-card-section>
              <div class="section-title">
                <q-icon name="store" />
                Informasi Angkringan
              </div>

              <div class="info-list q-mt-md">
                <div v-for="item in businessInformation" :key="item.label" class="info-item">
                  <div class="info-icon">
                    <q-icon :name="item.icon" color="amber" size="22px" />
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-5">{{ item.label }}</div>
                    <div class="text-body1 text-white text-weight-medium">
                      {{ item.value }}
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-5">
          <q-card class="info-card q-mb-md">
            <q-card-section>
              <div class="section-title">
                <q-icon name="person" />
                Informasi Akun
              </div>

              <div class="info-list q-mt-md">
                <div v-for="item in accountInformation" :key="item.label" class="info-item">
                  <div class="info-icon">
                    <q-icon :name="item.icon" color="amber" size="22px" />
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-5">{{ item.label }}</div>
                    <div class="text-body1 text-white text-weight-medium">
                      {{ item.value }}
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="security-card">
            <q-card-section class="row items-center no-wrap">
              <div class="security-icon">
                <q-icon name="shield" color="amber" size="28px" />
              </div>
              <div class="q-ml-md">
                <div class="text-subtitle1 text-white text-weight-bold">Akun terlindungi</div>
                <div class="text-caption text-grey-5">
                  Sesi akan berakhir otomatis setelah 30 menit tidak aktif.
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const getUserData = () => {
  try {
    return JSON.parse(localStorage.getItem('user_data') || '{}')
  } catch (error) {
    console.error('Gagal membaca data profil:', error)
    return {}
  }
}

const userData = getUserData()
const valueOrFallback = (...values) => values.find((value) => value !== undefined && value !== null && value !== '') || '-'

const profile = computed(() => ({
  id: valueOrFallback(userData.id, userData.angkringan_id),
  name: valueOrFallback(
    userData.nama_angkringan,
    userData.angkringan?.name,
    userData.angkringan?.nama_angkringan,
    userData.name,
    'Angkringan',
  ),
  owner: valueOrFallback(userData.owner, userData.nama_pemilik, userData.name),
  location: valueOrFallback(
    userData.lokasi,
    userData.alamat,
    userData.angkringan?.lokasi,
    userData.angkringan?.alamat,
    'Lokasi belum dilengkapi',
  ),
  phone: valueOrFallback(userData.no_telpon, userData.no_telp, userData.phone),
  email: valueOrFallback(userData.email),
  username: valueOrFallback(userData.username, userData.user_name, userData.email),
  isActive: !['nonaktif', 'inactive', '0', 0, false].includes(
    userData.flag ?? userData.status ?? userData.active,
  ),
}))

const businessInformation = computed(() => [
  { label: 'Nama Angkringan', value: profile.value.name, icon: 'storefront' },
  { label: 'Nama Pemilik', value: profile.value.owner, icon: 'badge' },
  { label: 'Lokasi', value: profile.value.location, icon: 'location_on' },
  { label: 'Nomor Telepon', value: profile.value.phone, icon: 'call' },
])

const accountInformation = computed(() => [
  { label: 'Username', value: profile.value.username, icon: 'account_circle' },
  { label: 'Email', value: profile.value.email, icon: 'mail' },
])
</script>

<style scoped>
.profile-page {
  min-height: 100%;
  background:
    radial-gradient(circle at 85% 5%, rgba(255, 193, 7, 0.1), transparent 28rem),
    #050505;
}

.profile-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
}

.profile-hero,
.info-card,
.security-card {
  overflow: hidden;
  border: 1px solid rgba(255, 193, 7, 0.16);
  border-radius: 20px;
  background: #151515;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.28);
}

.profile-hero {
  position: relative;
  background:
    linear-gradient(115deg, rgba(255, 193, 7, 0.16), transparent 55%),
    #151515;
}

.profile-hero::after {
  position: absolute;
  top: -80px;
  right: -50px;
  width: 220px;
  height: 220px;
  border: 1px solid rgba(255, 193, 7, 0.13);
  border-radius: 50%;
  content: '';
}

.profile-hero__content {
  position: relative;
  z-index: 1;
  padding: 32px;
}

.profile-avatar {
  border: 2px solid rgba(255, 193, 7, 0.7);
  background: #090909;
  box-shadow: 0 0 28px rgba(255, 193, 7, 0.16);
}

.status-badge {
  padding: 5px 10px;
}

.member-box {
  min-width: 128px;
  padding: 14px 18px;
  border: 1px solid rgba(255, 193, 7, 0.18);
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.22);
}

.section-title {
  display: flex;
  gap: 10px;
  align-items: center;
  color: #ffc107;
  font-size: 1.05rem;
  font-weight: 700;
}

.info-list {
  display: grid;
  gap: 4px;
}

.info-item {
  display: flex;
  gap: 14px;
  align-items: center;
  min-height: 72px;
  padding: 10px 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.info-item:last-child {
  border-bottom: 0;
}

.info-icon,
.security-icon {
  display: flex;
  flex: 0 0 44px;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 193, 7, 0.09);
}

.security-card {
  background:
    linear-gradient(100deg, rgba(255, 193, 7, 0.08), transparent),
    #151515;
}

@media (max-width: 599px) {
  .profile-hero__content {
    padding: 24px 18px;
  }

  .member-box {
    width: 100%;
  }
}
</style>
