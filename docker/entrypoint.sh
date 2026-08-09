#!/bin/sh

# Cache konfigurasi untuk performa maksimal di production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "Menunggu koneksi database..."
# Looping: mencoba koneksi ke DB. Jika gagal, tunggu 2 detik, coba lagi (Maksimal 60 detik).
RETRIES=30
until php artisan migrate:status > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo "Database belum siap, menunggu... ($RETRIES percobaan tersisa)"
  sleep 2
  RETRIES=$((RETRIES-1))
done

echo "Database siap! Menjalankan migrasi..."
php artisan migrate --force

# Serahkan kendali ke Supervisor untuk menjalankan Nginx & FPM
exec /usr/bin/supervisord -c /etc/supervisord.conf
