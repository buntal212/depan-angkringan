let idleTimer = null

const IDLE_TIME = 30 * 60 * 1000 // 30 menit

function logout() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('token_expires_at')
  localStorage.removeItem('user_data')

  window.location.href = '/login'
}

function resetTimer() {
  clearTimeout(idleTimer)

  if (!localStorage.getItem('auth_token')) return

  idleTimer = setTimeout(() => {
    logout()
  }, IDLE_TIME)
}

export default async () => {
  const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']

  events.forEach((event) => {
    window.addEventListener(event, resetTimer)
  })

  resetTimer()
}
