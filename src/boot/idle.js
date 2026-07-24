import { clearAuthSession, getTokenExpirationTime, isTokenExpired } from 'src/utils/authSession'

let idleTimer = null
let expirationTimer = null
let lastActivityAt = Date.now()
let isLoggingOut = false

const IDLE_TIME = 30 * 60 * 1000 // 30 menit
const MAX_TIMEOUT = 2_147_483_647

function logout(reason) {
  if (isLoggingOut) return

  isLoggingOut = true
  clearTimeout(idleTimer)
  clearTimeout(expirationTimer)
  clearAuthSession()

  console.info('[Auth Session]', `Logout otomatis: ${reason}.`)
  window.location.replace('/login')
}

function scheduleIdleTimer() {
  clearTimeout(idleTimer)

  if (!localStorage.getItem('auth_token')) return

  const remainingTime = IDLE_TIME - (Date.now() - lastActivityAt)

  if (remainingTime <= 0) {
    logout('tidak ada aktivitas selama 30 menit')
    return
  }

  idleTimer = setTimeout(() => {
    if (localStorage.getItem('auth_token')) {
      logout('tidak ada aktivitas selama 30 menit')
    }
  }, remainingTime)
}

function scheduleExpirationTimer() {
  clearTimeout(expirationTimer)

  if (!localStorage.getItem('auth_token')) return

  const expirationTime = getTokenExpirationTime()
  if (expirationTime === null) return

  const remainingTime = expirationTime - Date.now()

  if (remainingTime <= 0) {
    logout('token kedaluwarsa')
    return
  }

  expirationTimer = setTimeout(scheduleExpirationTimer, Math.min(remainingTime, MAX_TIMEOUT))
}

function resetActivityTimer() {
  if (!localStorage.getItem('auth_token')) return

  lastActivityAt = Date.now()
  scheduleIdleTimer()
}

function startSessionTimers() {
  isLoggingOut = false
  lastActivityAt = Date.now()

  if (isTokenExpired()) {
    logout('token kedaluwarsa')
    return
  }

  scheduleIdleTimer()
  scheduleExpirationTimer()
}

function stopSessionTimers() {
  clearTimeout(idleTimer)
  clearTimeout(expirationTimer)
}

export default async () => {
  const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']

  events.forEach((event) => {
    window.addEventListener(event, resetActivityTimer, { passive: true })
  })

  window.addEventListener('auth:login', startSessionTimers)
  window.addEventListener('auth:logout', stopSessionTimers)

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !localStorage.getItem('auth_token')) return

    if (isTokenExpired()) {
      logout('token kedaluwarsa')
      return
    }

    scheduleIdleTimer()
    scheduleExpirationTimer()
  })

  if (localStorage.getItem('auth_token')) {
    startSessionTimers()
  }
}
