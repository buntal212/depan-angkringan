const UPDATE_INTERVAL = 5 * 60 * 1000
const RELOAD_GUARD_KEY = 'pwa_controller_reload_at'
const RELOAD_GUARD_DURATION = 10 * 1000
const LOG_PREFIX = '[PWA Update]'

export default () => {
  if (!('serviceWorker' in navigator)) return

  let registration = null
  let updateInProgress = false
  let refreshing = false

  const checkForUpdate = async (source) => {
    if (updateInProgress || !navigator.onLine) return

    updateInProgress = true

    try {
      registration = registration || (await navigator.serviceWorker.getRegistration())

      if (!registration) {
        console.info(LOG_PREFIX, `Pemeriksaan dari ${source}: Service Worker belum terdaftar.`)
        return
      }

      console.info(LOG_PREFIX, `Memeriksa versi baru dari ${source}.`)
      await registration.update()
    } catch (error) {
      console.error(LOG_PREFIX, `Pemeriksaan update dari ${source} gagal:`, error)
    } finally {
      updateInProgress = false
    }
  }

  window.addEventListener('pwa:registered', (event) => {
    registration = event.detail
    void checkForUpdate('registrasi awal')
  })

  window.addEventListener('pwa:updated', () => {
    console.info(LOG_PREFIX, 'Menunggu Service Worker baru mengambil alih aplikasi.')
  })

  window.addEventListener('load', () => {
    void checkForUpdate('aplikasi dibuka')
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void checkForUpdate('aplikasi kembali aktif')
    }
  })

  window.addEventListener('online', () => {
    void checkForUpdate('koneksi kembali online')
  })

  window.setInterval(() => {
    void checkForUpdate('interval 5 menit')
  }, UPDATE_INTERVAL)

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    const now = Date.now()
    const lastReload = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) || 0)

    if (refreshing || now - lastReload < RELOAD_GUARD_DURATION) {
      console.warn(LOG_PREFIX, 'Reload kedua dicegah untuk menghindari reload loop.')
      return
    }

    refreshing = true
    sessionStorage.setItem(RELOAD_GUARD_KEY, String(now))
    console.info(LOG_PREFIX, 'Service Worker baru aktif. Memuat ulang aplikasi satu kali.')
    window.location.reload()
  })
}
