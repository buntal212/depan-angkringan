# Deployment PWA ke VPS aaPanel

Deployment dibuat dalam mode aman dan hanya berjalan ketika dipicu manual melalui GitHub Actions.
Push ke branch `main` tidak langsung mengubah server.

## 1. Siapkan direktori deployment

Tentukan direktori khusus deployment, misalnya:

```text
/www/wwwroot/depan-angkringan-deploy
```

Jangan menggunakan `/` atau direktori sistem sebagai root deployment.
Script akan membuat struktur berikut secara otomatis:

```text
depan-angkringan-deploy/
├── current -> releases/<commit-sha>
└── releases/
    └── <commit-sha>/
```

User SSH yang dipakai GitHub Actions harus memiliki izin tulis ke direktori tersebut.

## 2. Pasang public key pada VPS

Buat SSH key khusus deployment. Simpan public key di:

```text
~/.ssh/authorized_keys
```

Simpan private key sebagai GitHub Secret `VPS_SSH_PRIVATE_KEY`.
Jangan menyimpan private key di repository.

## 3. Tambahkan GitHub Secrets

Buka:

```text
Repository → Settings → Secrets and variables → Actions
```

Tambahkan repository secrets berikut:

| Secret                | Isi                                           |
| --------------------- | --------------------------------------------- |
| `VITE_API_BASE_URL`   | URL API production                            |
| `VPS_HOST`            | IP atau hostname VPS                          |
| `VPS_PORT`            | Port SSH, kosongkan jika menggunakan 22       |
| `VPS_USER`            | User SSH deployment                           |
| `VPS_SSH_PRIVATE_KEY` | Private key SSH khusus deployment             |
| `VPS_DEPLOY_ROOT`     | Contoh `/www/wwwroot/depan-angkringan-deploy` |

## 4. Konfigurasi Nginx aaPanel

Buka:

```text
Website → nama website → Config
```

Gunakan konfigurasi pada `deployment/nginx-pwa.conf`. Ganti:

```text
/www/wwwroot/DEPLOY_ROOT
```

dengan nilai yang sama seperti `VPS_DEPLOY_ROOT`.

Periksa konfigurasi sebelum reload:

```bash
nginx -t
```

Jika valid, lakukan reload Nginx melalui aaPanel.

Perubahan root Nginx dilakukan satu kali saat setup awal. Sebelum menjalankannya, pastikan deployment
pertama sudah menghasilkan symlink `current`, atau buat release awal terlebih dahulu.

## 5. Jalankan deployment

Buka:

```text
Repository → Actions → Deploy PWA ke aaPanel → Run workflow
```

Workflow akan:

1. Memvalidasi konfigurasi.
2. Menjalankan `npm ci`.
3. Menjalankan lint.
4. Membangun Quasar PWA dengan InjectManifest.
5. Memvalidasi `index.html`, `manifest.json`, `sw.js`, dan folder asset.
6. Mengunggah release ke `/tmp` pada VPS.
7. Mengekstrak release ke folder baru.
8. Memvalidasi asset yang direferensikan `index.html`.
9. Mengganti symlink `current` secara atomik.
10. Menyimpan lima release terbaru.

## Rollback manual

Lihat release yang tersedia:

```bash
ls -lah /www/wwwroot/depan-angkringan-deploy/releases
```

Alihkan `current` ke release sebelumnya:

```bash
ln -sfn /www/wwwroot/depan-angkringan-deploy/releases/COMMIT_SEBELUMNYA \
  /www/wwwroot/depan-angkringan-deploy/current
```

Karena file bersifat statis, perubahan symlink tidak memerlukan restart aplikasi. Nginx akan melayani
release yang ditunjuk oleh `current`.
