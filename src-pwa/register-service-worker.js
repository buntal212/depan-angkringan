import { register } from 'register-service-worker'

const LOG_PREFIX = '[PWA Update]'

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready(registration) {
    console.info(LOG_PREFIX, 'Service Worker aktif dan siap digunakan.')
    window.dispatchEvent(new CustomEvent('pwa:registered', { detail: registration }))
  },

  registered(registration) {
    console.info(LOG_PREFIX, 'Service Worker berhasil didaftarkan.')
    window.dispatchEvent(new CustomEvent('pwa:registered', { detail: registration }))
  },

  cached(/* registration */) {
    console.info(LOG_PREFIX, 'Asset aplikasi selesai disimpan untuk penggunaan offline.')
  },

  updatefound(/* registration */) {
    console.info(LOG_PREFIX, 'Versi baru ditemukan dan sedang diunduh.')
  },

  updated(registration) {
    console.info(LOG_PREFIX, 'Versi baru selesai dipasang dan siap diaktifkan.')
    window.dispatchEvent(new CustomEvent('pwa:updated', { detail: registration }))
  },

  offline() {
    console.warn(LOG_PREFIX, 'Tidak ada koneksi internet. Aplikasi berjalan dalam mode offline.')
  },

  error(err) {
    console.error(LOG_PREFIX, 'Registrasi atau pembaruan Service Worker gagal:', err)
  },
})
