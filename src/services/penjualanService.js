import axios from 'axios'
import { clearAuthSession } from 'src/utils/authSession'

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      clearAuthSession()
      window.location.replace('/login')
    }
    return Promise.reject(error)
  },
)

export const penjualanService = {
  // Get all transactions
  getTransactions: async (params = {}) => {
    try {
      const response = await api.get('/penjualan', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get single transaction
  getTransaction: async (id) => {
    try {
      const response = await api.get(`/penjualan/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Create new transaction
  createTransaction: async (transactionData) => {
    try {
      const response = await api.post('/penjualan', transactionData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Update transaction
  updateTransaction: async (id, transactionData) => {
    try {
      const response = await api.put(`/penjualan/${id}`, transactionData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    try {
      const response = await api.delete(`/penjualan/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get transaction by date range
  getTransactionsByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get('/penjualan/range', {
        params: { startDate, endDate },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get daily sales summary
  getDailySummary: async (date) => {
    try {
      const response = await api.get('/penjualan/summary/daily', {
        params: { date },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get monthly sales summary
  getMonthlySummary: async (year, month) => {
    try {
      const response = await api.get('/penjualan/summary/monthly', {
        params: { year, month },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Generate transaction report
  generateReport: async (filters = {}) => {
    try {
      const response = await api.post('/penjualan/report', filters, {
        responseType: 'blob',
      })
      return response
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get top selling items
  getTopSellingItems: async (limit = 10) => {
    try {
      const response = await api.get('/penjualan/top-items', {
        params: { limit },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },
}

export default api
