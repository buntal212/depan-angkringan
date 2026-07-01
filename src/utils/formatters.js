/**
 * Format harga dengan aman untuk Indonesia Rupiah
 * @param {number|string} value - Nilai yang akan diformat
 * @param {Object} options - Opsi formatting tambahan
 * @returns {string} Harga yang sudah diformat
 */
export const formatPrice = (value = 0, options = {}) => {
  // Convert to number dengan fallback 0
  const numValue = Number(value || 0)

  // Cek jika valid number
  if (isNaN(numValue)) {
    return 'Rp 0'
  }

  const defaultOptions = {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }

  try {
    return numValue.toLocaleString('id-ID', defaultOptions)
  } catch (error) {
    console.error('Error formatting price:', error)
    return 'Rp 0'
  }
}

/**
 * Format angka dengan titik sebagai separator ribuan
 * @param {number|string} value - Nilai yang akan diformat
 * @returns {string} Angka yang sudah diformat
 */
export const formatNumber = (value = 0) => {
  const numValue = Number(value || 0)

  if (isNaN(numValue)) {
    return '0'
  }

  try {
    return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  } catch (error) {
    console.error('Error formatting number:', error)
    return '0'
  }
}

/**
 * Format persentase dengan aman
 * @param {number|string} value - Nilai persentase
 * @param {number} decimals - Jumlah desimal
 * @returns {string} Persentase yang sudah diformat
 */
export const formatPercent = (value = 0, decimals = 0) => {
  const numValue = Number(value || 0)

  if (isNaN(numValue)) {
    return '0%'
  }

  try {
    return `${numValue.toFixed(decimals)}%`
  } catch (error) {
    console.error('Error formatting percent:', error)
    return '0%'
  }
}

/**
 * Safe getter untuk nested object properties
 * @param {Object} obj - Object yang akan diakses
 * @param {string} path - Path ke property (contoh: 'user.address.street')
 * @param {*} defaultValue - Nilai default jika path tidak ditemukan
 * @returns {*} Nilai property atau default value
 */
// export const safeGet = (obj, path, defaultValue = null) => {
//   if (!obj || typeof obj !== 'object') {
//     return defaultValue
//   }

//   const keys = path.split('.')
//   let result = obj

//   for (const key of keys) {
//     if (result === null || result === undefined || !result.hasOwnProperty(key)) {
//       return defaultValue
//     }
//     result = result[key]
//   }

//   return result === undefined ? defaultValue : result
// }

/**
 * Validasi bahwa value adalah angka yang valid
 * @param {*} value - Value yang akan divalidasi
 * @returns {boolean} True jika valid number
 */
export const isValidNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return false
  }

  const num = Number(value)
  return !isNaN(num) && isFinite(num)
}

/**
 * Mendapatkan nilai angka yang aman
 * @param {*} value - Value yang akan diambil nilai angkanya
 * @param {number} defaultValue - Nilai default jika tidak valid
 * @returns {number} Nilai angka yang aman
 */
export const getSafeNumber = (value, defaultValue = 0) => {
  return isValidNumber(value) ? Number(value) : defaultValue
}
