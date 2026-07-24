const AUTH_STORAGE_KEYS = ['auth_token', 'token_expires_at', 'user_data']

export const clearAuthSession = () => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
  window.dispatchEvent(new Event('auth:logout'))
}

export const getTokenExpirationTime = () => {
  const storedValue = localStorage.getItem('token_expires_at')

  if (!storedValue) return null

  let expiresAt = storedValue

  try {
    expiresAt = JSON.parse(storedValue)
  } catch {
    // Nilai lama mungkin tersimpan langsung tanpa format JSON.
  }

  if (typeof expiresAt === 'number' || /^\d+$/.test(String(expiresAt))) {
    const numericValue = Number(expiresAt)
    return numericValue < 1_000_000_000_000 ? numericValue * 1000 : numericValue
  }

  const timestamp = new Date(expiresAt).getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}

export const isTokenExpired = () => {
  const expirationTime = getTokenExpirationTime()
  return expirationTime !== null && Date.now() >= expirationTime
}
