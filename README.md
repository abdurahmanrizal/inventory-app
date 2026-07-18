# WMS BAS

Warehouse Management System untuk mengelola stok gudang utama dan unit, transaksi barang masuk/keluar, mutasi, permintaan stok, approval, serta histori pergerakan persediaan.

Aplikasi dibangun menggunakan Laravel, Inertia.js, React, TypeScript, Tailwind CSS, dan MySQL.

## Fitur Utama

- Dashboard ringkasan stok, nilai persediaan, transaksi terbaru, dan approval.
- Monitoring stok per gudang, unit, lokasi, item, dan batch.
- Pencatatan Stock In, Stock Out, dan transfer antargudang.
- Workflow approval sebelum transaksi memengaruhi stok.
- Permintaan, persiapan, pengiriman, dan penerimaan stok unit.
- Inventory control melalui stock opname dan stock adjustment.
- Master data item, supplier, UOM, lokasi, dan gudang.
- Dukungan FIFO/FEFO, tanggal kedaluwarsa, reservasi stok, dan moving average cost.
- Stock ledger dan riwayat aktivitas transaksi.
- Dokumen transaksi dalam format PDF.
- Manajemen pengguna, role, permission, dan hak akses per modul.
- Autentikasi, verifikasi email, two-factor authentication, dan passkey.

## Teknologi

### Backend

- PHP 8.3+
- Laravel 13
- Laravel Fortify
- Inertia Laravel
- Dompdf
- MySQL

### Frontend

- React 19
- TypeScript
- Inertia.js 3
- Tailwind CSS 4
- Vite 8
- Radix UI dan Lucide React

### Quality Assurance

- PHPUnit
- Larastan/PHPStan
- Laravel Pint
- ESLint
- Prettier
- TypeScript compiler

## Kebutuhan Sistem

Pastikan perangkat memiliki:

- PHP 8.3 atau lebih baru beserta ekstensi yang dibutuhkan Laravel.
- Composer 2.
- Node.js 20.19+ atau 22.12+.
- npm.
- MySQL 8 atau versi kompatibel.

## Instalasi Lokal

1. Clone repository dan masuk ke direktori project.

   ```bash
   git clone <repository-url> wms-bas
   cd wms-bas
   ```

2. Install dependency PHP.

   ```bash
   composer install
   ```

3. Salin konfigurasi environment dan buat application key.

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. Buat database MySQL bernama `wms_bas`, kemudian sesuaikan konfigurasi berikut di `.env` jika diperlukan.

   ```dotenv
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=wms_bas
   DB_USERNAME=root
   DB_PASSWORD=
   ```

5. Jalankan migration dan seed data demo.

   ```bash
   php artisan migrate --seed
   ```

6. Install dependency frontend.

   ```bash
   npm install
   ```

7. Jalankan backend dan frontend menggunakan dua terminal.

   Terminal pertama:

   ```bash
   php artisan serve
   ```

   Terminal kedua:

   ```bash
   npm run dev
   ```

8. Buka alamat yang ditampilkan oleh Laravel, umumnya `http://127.0.0.1:8000`.

## Akun Demo

Jalankan `php artisan migrate --seed` untuk membuat data dan akun demo. Semua akun berikut menggunakan password `password`.

| Role                    | Email                      |
| ----------------------- | -------------------------- |
| Super Admin             | `superadmin@wms.test`      |
| Admin Gudang Kering     | `admin.kering@wms.test`    |
| Manajer Gudang Kering   | `manager.kering@wms.test`  |
| Admin Gudang Basah      | `admin.basah@wms.test`     |
| Manajer Gudang Basah    | `manager.basah@wms.test`   |
| User Unit Cafe          | `user.cafe@wms.test`       |
| Manajer Unit Cafe       | `manager.cafe@wms.test`    |
| User Unit Kitchen       | `user.kitchen@wms.test`    |
| Manajer Unit Kitchen    | `manager.kitchen@wms.test` |
| User Unit Restaurant    | `user.resto@wms.test`      |
| Manajer Unit Restaurant | `manager.resto@wms.test`   |

> Akun tersebut hanya ditujukan untuk development dan pengujian. Ganti atau hapus kredensial demo sebelum deployment production.

## Role Aplikasi

- `superadmin`: mengelola seluruh data, user, role, permission, master data, dan approval.
- `warehouse_admin_dry`: mengelola transaksi dan item untuk gudang kering.
- `warehouse_admin_wet`: mengelola transaksi dan item untuk gudang basah.
- `unit_user`: melihat stok unit serta menjalankan permintaan dan penerimaan stok sesuai permission.
- `unit_manager`: memantau stok dan memproses approval yang ditugaskan.

Penjelasan alur setiap role secara lebih lengkap tersedia di [docs/ALUR_ROLE_WMS.md](docs/ALUR_ROLE_WMS.md).

## Alur Transaksi Stok

```text
Pembuatan dokumen
        ↓
Validasi gudang, item, batch, dan jumlah
        ↓
Menunggu approval
        ↓
   Approve / Reject
        ↓
Posting stok dan stock ledger (jika disetujui)
```

Stok tidak langsung berubah ketika dokumen dibuat. Perubahan stok terjadi setelah approval terakhir berhasil dan seluruh validasi persediaan terpenuhi.

## Perintah Development

### Frontend

```bash
npm run dev          # Menjalankan Vite development server
npm run build        # Membuat build production
npm run lint:check   # Memeriksa ESLint
npm run format:check # Memeriksa format Prettier
npm run types:check  # Memeriksa TypeScript
```

Untuk memperbaiki lint dan format secara otomatis:

```bash
npm run lint
npm run format
```

### Backend

```bash
composer test        # Pint, PHPStan, dan PHPUnit
composer lint:check  # Memeriksa Laravel Pint
composer types:check # Menjalankan PHPStan
php artisan test     # Menjalankan PHPUnit saja
```

Untuk menjalankan seluruh pemeriksaan backend dan frontend:

```bash
composer ci:check
```

## Build Production

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan optimize
```

Pastikan konfigurasi production menggunakan `APP_ENV=production`, `APP_DEBUG=false`, kredensial database yang aman, serta web server yang mengarah ke direktori `public/`.

## Struktur Direktori

```text
app/
├── Http/Controllers/   Controller halaman dan transaksi
├── Models/             Model data WMS
├── Services/           Logika workflow dan pergerakan stok
└── Support/            Definisi permission aplikasi

database/
├── migrations/         Struktur database
└── seeders/            Data awal dan akun demo

resources/js/
├── components/         Komponen antarmuka bersama
├── layouts/            Layout aplikasi
├── lib/                Helper frontend
└── pages/              Halaman Inertia React

routes/                 Definisi route aplikasi
tests/                  Feature test dan unit test
docs/                   Dokumentasi alur bisnis
```

## Catatan Keamanan

- Jangan commit file `.env` atau kredensial production.
- Jangan gunakan password akun demo di production.
- Pastikan permission direktori `storage/` dan `bootstrap/cache/` sesuai kebutuhan web server.
- Jalankan migration, test, lint, dan build sebelum deployment.

## Lisensi

Project ini menggunakan lisensi MIT sesuai konfigurasi Composer.
