import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const initialFilters = () => {
  const now = new Date()
  return {
    outlet: null,
    dateFrom: formatDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    dateTo: formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    paymentMethod: null,
    paymentStatus: null,
    search: '',
  }
}

const numberValue = (value) => Number(value || 0)
const transactionItems = (row) => row.rinci || row.items || row.details || []
const transactionTotal = (row) =>
  numberValue(row.grand_total ?? row.total_harga ?? row.total ?? row.subtotal)
const transactionSubtotal = (row) =>
  numberValue(row.subtotal ?? row.total_harga ?? row.total ?? row.grand_total) +
  numberValue(row.diskon ?? row.discount)

const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

export const useLaporanPenjualanStore = defineStore('laporan-penjualan', {
  state: () => ({
    transactions: [],
    outlets: [],
    filters: initialFilters(),
    loading: false,
    loadingOutlets: false,
    error: null,
    lastUpdated: null,
  }),

  getters: {
    summary: (state) => {
      const totalTransactions = state.transactions.length
      const totalSales = state.transactions.reduce((sum, row) => sum + transactionTotal(row), 0)
      const totalItems = state.transactions.reduce(
        (sum, row) =>
          sum +
          transactionItems(row).reduce(
            (itemSum, item) => itemSum + numberValue(item.jumlah ?? item.qty ?? item.quantity),
            0,
          ),
        0,
      )

      return {
        totalTransactions,
        totalSales,
        totalItems,
        averageTransaction: totalTransactions ? totalSales / totalTransactions : 0,
      }
    },

    dailySales: (state) => {
      const grouped = state.transactions.reduce((result, row) => {
        const key = String(row.tanggal_transaksi || row.tanggal || row.created_at || '').slice(
          0,
          10,
        )
        if (key) result[key] = (result[key] || 0) + transactionTotal(row)
        return result
      }, {})

      return Object.entries(grouped)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, value]) => ({ date, value }))
    },

    paymentSales: (state) => {
      const grouped = state.transactions.reduce((result, row) => {
        const method = String(row.metode_bayar || row.payment_method || 'Lainnya').toUpperCase()
        result[method] = (result[method] || 0) + transactionTotal(row)
        return result
      }, {})

      return Object.entries(grouped)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
    },
  },

  actions: {
    async fetchOutlets() {
      this.loadingOutlets = true
      try {
        const response = await api.get('/master-angkringan', { per_page: 200 })
        const payload = response.data?.data ?? response.data
        this.outlets = Array.isArray(payload) ? payload : payload?.data || []
      } catch (error) {
        console.error('Gagal memuat outlet laporan:', error)
      } finally {
        this.loadingOutlets = false
      }
    },

    async fetchReport() {
      if (this.loading) return
      this.loading = true
      this.error = null

      try {
        const baseParams = {
          per_page: 500,
          search: this.filters.search || undefined,
          dateFrom: this.filters.dateFrom || undefined,
          dateTo: this.filters.dateTo || undefined,
          angkringan_id: this.filters.outlet || undefined,
          metode_bayar: this.filters.paymentMethod || undefined,
          flag: this.filters.paymentStatus || undefined,
        }
        const allTransactions = []
        const seenIds = new Set()
        const maxPages = 1000
        let page = 1
        let hasNextPage = true

        while (hasNextPage && page <= maxPages) {
          const response = await api.get('/penjualan-getlist', { ...baseParams, page })
          const payload = response.data?.data ?? response.data
          const pageItems = Array.isArray(payload) ? payload : payload?.data || []

          pageItems.forEach((item) => {
            const key = item.id ?? `${item.no_transaksi || ''}-${item.tanggal_transaksi || ''}`
            if (!seenIds.has(key)) {
              seenIds.add(key)
              allTransactions.push(item)
            }
          })

          if (Array.isArray(payload)) {
            hasNextPage = false
          } else {
            const currentPage = Number(payload?.current_page || page)
            const lastPage = Number(payload?.last_page || currentPage)
            hasNextPage = Boolean(payload?.next_page_url) || currentPage < lastPage
            page = currentPage + 1
          }
        }

        if (hasNextPage) {
          throw new Error('Jumlah halaman laporan melebihi batas aman pengambilan data.')
        }

        this.transactions = allTransactions
        this.lastUpdated = new Date().toISOString()
      } catch (error) {
        this.transactions = []
        this.error =
          error?.response?.data?.message || 'Data laporan gagal dimuat. Silakan coba lagi.'
        console.error('Gagal memuat laporan penjualan:', error)
      } finally {
        this.loading = false
      }
    },

    async resetFilters() {
      this.filters = initialFilters()
      await this.fetchReport()
    },

    exportExcel() {
      const headers = [
        'No Transaksi',
        'Tanggal',
        'Outlet',
        'Kasir',
        'Jumlah Item',
        'Subtotal',
        'Diskon',
        'Grand Total',
        'Metode Bayar',
        'Status',
      ]
      const rows = this.transactions.map((row) => [
        row.no_transaksi || row.notrans || '-',
        row.tanggal_transaksi || row.tanggal || row.created_at || '-',
        row.angkringan?.name || row.angkringan?.nama_angkringan || row.outlet?.name || '-',
        row.kasir?.name || row.user?.name || row.created_by?.name || row.kasir || '-',
        transactionItems(row).reduce(
          (sum, item) => sum + numberValue(item.jumlah ?? item.qty ?? item.quantity),
          0,
        ),
        transactionSubtotal(row),
        numberValue(row.diskon ?? row.discount),
        transactionTotal(row),
        row.metode_bayar || row.payment_method || '-',
        String(row.flag) === '2' || row.status_pembayaran === 'LUNAS' ? 'Lunas' : 'Belum Bayar',
      ])
      const csv = `\ufeff${[headers, ...rows].map((row) => row.map(escapeCsv).join(';')).join('\n')}`
      const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `laporan-penjualan-${formatDate(new Date())}.csv`
      link.click()
      URL.revokeObjectURL(url)
    },

    exportPdf() {
      const reportWindow = window.open('', '_blank', 'width=1100,height=760')
      if (!reportWindow) throw new Error('Popup diblokir browser')

      const rows = this.transactions
        .map(
          (row) => `<tr>
            <td>${escapeHtml(row.no_transaksi || '-')}</td>
            <td>${escapeHtml(String(row.tanggal_transaksi || '-').slice(0, 16))}</td>
            <td>${escapeHtml(row.angkringan?.name || row.angkringan?.nama_angkringan || '-')}</td>
            <td>${escapeHtml(row.metode_bayar || '-')}</td>
            <td style="text-align:right">Rp ${transactionTotal(row).toLocaleString('id-ID')}</td>
          </tr>`,
        )
        .join('')

      reportWindow.document.write(`<!doctype html><html><head><title>Laporan Penjualan</title>
        <style>body{font-family:Arial,sans-serif;color:#171717;padding:32px}h1{margin:0 0 4px}p{color:#666;margin:0 0 24px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:10px;border-bottom:1px solid #ddd;text-align:left}th{background:#ffc107;color:#111}.summary{display:flex;gap:24px;margin:20px 0}.summary b{display:block;font-size:18px}@media print{body{padding:0}}</style>
        </head><body><h1>Laporan Penjualan</h1><p>Periode ${escapeHtml(this.filters.dateFrom)} s/d ${escapeHtml(this.filters.dateTo)}</p>
        <div class="summary"><div>Total Transaksi<b>${this.summary.totalTransactions}</b></div><div>Total Penjualan<b>Rp ${this.summary.totalSales.toLocaleString('id-ID')}</b></div><div>Total Item<b>${this.summary.totalItems}</b></div></div>
        <table><thead><tr><th>No Transaksi</th><th>Tanggal</th><th>Outlet</th><th>Metode Bayar</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
        <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</${'script'}></body></html>`)
      reportWindow.document.close()
    },
  },
})
