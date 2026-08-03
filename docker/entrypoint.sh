#!/bin/sh

# Cache konfigurasi untuk performa maksimal di production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Tunggu sampai database MySQL benar-benar siap menerima koneksi (Maksimal 60 detik)
echo "Menunggu koneksi database..."
php artisan db:wait --timeout=60

# Setelah database siap, jalankan migrasi otomatis
php artisan migrate --force

# Serahkan kendali ke Supervisor untuk menjalankan Nginx & FPM
exec /usr/bin/supervisord -c /etc/supervisord.conf