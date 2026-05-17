import { Notify } from 'quasar'

export const notifySuccess = (message) => {
  Notify.create({
    type: 'positive',
    message: message || 'Berhasil!',
    position: 'top-right',
    icon: 'check_circle',
    timeout: 3000,
    classes: 'glossy'
  })
}

export const notifyError = (message) => {
  Notify.create({
    type: 'negative',
    message: message || 'Terjadi kesalahan.',
    position: 'top-right',
    icon: 'error',
    timeout: 3500,
    classes: 'glossy'
  })
}
