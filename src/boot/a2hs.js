import { ref } from 'vue'

export const deferredPrompt = ref(null)
export const canInstall = ref(false)

export default async () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // console.log('🔥 INSTALL AVAILABLE')

    e.preventDefault()

    deferredPrompt.value = e
    canInstall.value = true
  })

  window.addEventListener('appinstalled', () => {
    // console.log('✅ APP INSTALLED')

    deferredPrompt.value = null
    canInstall.value = false
  })
}
