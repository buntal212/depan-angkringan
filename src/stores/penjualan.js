import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function awalBulan() {
  const now = new Date()
  return formatDate(new Date(now.getFullYear(), now.getMonth(), 1))
}

function akhirBulan() {
  const now = new Date()
  return formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
}
export const usePenjualanStore = defineStore('penjualan', {
  state: () => ({
    items: [],
    itemPenjualan: null,
    dialogModel: false,
    loading: false,
    loadingBayar: false,
    saving: false,
    doneList: false,
    done: false,
    page: 1,
    paramsangkringan: {
      filterAngkringanId: null,
    },
    showDialogBayar: false,
    form: {
      id: '',
      notrans: '',
      tgl: new Date().toISOString().slice(0, 10),
      kode_angkringan: null,
      atasnama: '',
      metode_bayar: '',
      catatan: '',
      total: 0,
      items: [],
    },
    formBayar: {
      id: null,
      no_transaksi: '',
      total: 0,
      metode_bayar: 'CASH',
      dibayar: 0,
      kembalian: 0,
    },
    listPenjualan: [],
    loadingList: false,
    paginationPenjualan: {
      page: 1,
      per_page: 10,
      last_page: 1,
      total: 0,
    },
    paramsList: {
      search: '',
      dateFrom: awalBulan(),
      dateTo: akhirBulan(),
      angkringan_id: null,
    },
  }),
  actions: {
    async getItems(append = false) {
      if (this.loading || this.done) return

      this.loading = true
      const params = {
        page: this.page,
        angkringan_id: this.filterAngkringanId,
      }
      try {
        const res = await api.get('/master-angkringan', params)

        const payload = res.data.data ?? res.data
        const newItems = payload.data || []
        const currentPage = payload.current_page || 1
        const lastPage = payload.last_page || 1

        if (append) {
          this.items.push(...newItems)
        } else {
          this.items = newItems
        }

        if (currentPage >= lastPage || newItems.length === 0) {
          this.done = true
        } else {
          this.page++
        }
      } catch (err) {
        console.error('API ERROR:', err)
      } finally {
        this.loading = false
      }
    },
    resetData() {
      this.items = []
      this.page = 1
      this.done = false
    },
    async simpanPenjualan() {
      if (this.saving) return

      this.saving = true

      try {
        const resp = await api.post('/penjualan-simpan', this.form)

        const data = resp.data.data

        // inject response ke state
        this.itemPenjualan = data

        // inject ke form juga kalau mau dipakai di UI
        this.form.id = data.id
        this.form.notrans = data.no_transaksi
        this.form.tgl = data.tanggal_transaksi?.slice(0, 10)
        this.form.kode_angkringan = data.angkringan_id
        this.form.total = Number(data.total_harga || 0)
        this.form.catatan = data.keterangan || ''

        this.form.items =
          data.rinci?.map((x) => ({
            id: x.id,
            header_id: x.header_id,
            kodemenu: x.menu_id,
            qty: Number(x.jumlah || 0),
            harga: Number(x.harga_satuan || 0),
            subtotal: Number(x.subtotal || 0),
          })) || []

        Notify.create({
          type: 'positive',
          message: resp.data.message || 'Penjualan berhasil disimpan',
          position: 'top',
        })

        return resp.data
      } catch (err) {
        console.error(err)

        Notify.create({
          type: 'negative',
          message: err?.response?.data?.message || 'Gagal menyimpan penjualan',
          position: 'top',
        })

        throw err
      } finally {
        this.saving = false
      }
    },
    resetForm() {
      this.form = {
        id: '',
        notrans: '',
        tgl: new Date().toISOString().slice(0, 10),
        kode_angkringan: null,
        atasnama: '',
        metode_bayar: '',
        catatan: '',
        total: 0,
        items: [],
      }
    },
    async getListPenjualan(append = false) {
      if (this.loadingList) return
      if (append && this.doneList) return

      this.loadingList = true

      try {
        const params = {
          page: this.paginationPenjualan.page,
          per_page: this.paginationPenjualan.per_page,
          search: this.paramsList.search || undefined,
          // dateFrom: this.paramsList.dateFrom || undefined,
          dateFrom: this.paramsList.dateFrom || undefined,
          dateTo: this.paramsList.dateTo || undefined,
          angkringan_id: this.paramsList.angkringan_id || undefined,
        }
        console.log('REQUEST PAGE:', this.paginationPenjualan.page)
        const res = await api.get('/penjualan-getlist', params)
        console.log('RESPONSE:', res.data.data ?? res.data)
        const payload = res.data.data ?? res.data
        const newItems = payload.data || []

        if (append) {
          const existingIds = new Set(this.listPenjualan.map((x) => x.id))
          const filteredItems = newItems.filter((x) => !existingIds.has(x.id))
          this.listPenjualan.push(...filteredItems)
        } else {
          this.listPenjualan = newItems
        }

        const currentPage = Number(payload.current_page || this.paginationPenjualan.page)

        this.paginationPenjualan.page = currentPage + 1
        this.doneList = !payload.next_page_url || newItems.length === 0
      } catch (err) {
        console.error('Gagal memuat list penjualan:', err)

        Notify.create({
          type: 'negative',
          message: err?.response?.data?.message || 'Gagal memuat data penjualan',
          position: 'top',
        })
      } finally {
        this.loadingList = false
      }
    },
    resetListPenjualan() {
      this.listPenjualan = []
      this.paginationPenjualan.page = 1
      this.paginationPenjualan.last_page = 1
      this.paginationPenjualan.total = 0
      this.loadingList = false
      this.doneList = false
    },
    reloadListPenjualan() {
      this.resetListPenjualan()
      this.getListPenjualan(false)
    },
    resetListFilter() {
      this.paramsList.search = ''
      this.paramsList.dateFrom = awalBulan()
      this.paramsList.dateTo = akhirBulan()
      this.paramsList.angkringan_id = null
      this.reloadListPenjualan()
    },
    setPagePenjualan(page) {
      this.paginationPenjualan.page = page
      this.getListPenjualan()
    },
    setEditForm(data) {
      this.resetForm()

      this.itemPenjualan = data

      this.form.id = data.id || ''
      this.form.notrans = data.no_transaksi || ''
      this.form.tgl = data.tanggal_transaksi?.slice(0, 10) || new Date().toISOString().slice(0, 10)
      this.form.kode_angkringan = data.angkringan_id || null
      this.form.catatan = data.keterangan || ''
      this.form.atasnama = data.atasnama || ''
      this.form.metode_bayar = data.metode_bayar || ''
      this.form.total = Number(data.total_harga || 0)

      this.form.items = (data.rinci || []).map((x) => ({
        id: x.id,
        kodemenu: x.menu_id,
        nama_menu: x.menu?.nama_menu || x.menu?.name || x.nama_menu || x.menu_id,
        harga: Number(x.harga_satuan || 0),
        qty: Number(x.jumlah || 0),
        subtotal: Number(x.subtotal || 0),
        catatan: x.catatan || '',
      }))
    },
    openDialogBayar(item) {
      this.formBayar = {
        id: item.id,
        no_transaksi: item.no_transaksi,
        total: Number(item.total_harga || 0),
        metode_bayar: item.metode_bayar || 'CASH',
        dibayar: Number(item.total_harga || 0),
        kembalian: 0,
      }

      this.hitungKembalian()

      this.showDialogBayar = true
    },

    closeDialogBayar() {
      this.showDialogBayar = false

      this.formBayar = {
        id: null,
        no_transaksi: '',
        total: 0,
        metode_bayar: 'CASH',
        dibayar: 0,
        kembalian: 0,
      }
    },

    hitungKembalian() {
      this.formBayar.kembalian =
        Number(this.formBayar.dibayar || 0) - Number(this.formBayar.total || 0)
    },

    tekanKalkulatorBayar(key) {
      if (key === 'C') {
        this.formBayar.dibayar = 0
        this.hitungKembalian()
        return
      }

      const current = String(this.formBayar.dibayar || '')
      this.formBayar.dibayar = Number(current + key)
      this.hitungKembalian()
    },
    async simpanPembayaran() {
      if (this.loadingBayar) return

      this.loadingBayar = true

      try {
        const res = await api.post('/penjualan-bayar', this.formBayar)

        const payload = res.data.data ?? res.data

        // inject/update data di list penjualan
        const index = this.listPenjualan.findIndex((item) => item.id === payload.id)

        if (index !== -1) {
          this.listPenjualan[index] = {
            ...this.listPenjualan[index],
            ...payload,
          }
        }

        // inject data terakhir
        this.itemPenjualan = payload

        // tutup dialog
        this.closeDialogBayar()

        Notify.create({
          type: 'positive',
          message: res.data.message || 'Pembayaran berhasil disimpan',
          position: 'top',
        })

        return payload
      } catch (err) {
        console.error('API ERROR:', err)

        Notify.create({
          type: 'negative',
          message: err?.response?.data?.message || 'Gagal menyimpan pembayaran',
          position: 'top',
        })

        throw err
      } finally {
        this.loadingBayar = false
      }
    },
  },
})
