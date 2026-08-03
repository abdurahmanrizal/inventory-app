# ==========================================
# STAGE 0: Base PHP (Inti untuk semua stage)
# ==========================================
FROM php:8.4-fpm-alpine AS base

RUN apk add --no-cache \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl

# ==========================================
# STAGE 1: Backend Build (Composer)
# ==========================================
FROM base AS backend
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --ignore-platform-reqs --no-scripts

# ==========================================
# STAGE 2: Frontend Build (Node.js + PHP)
# ==========================================
FROM base AS frontend
RUN apk add --no-cache nodejs npm

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
COPY --from=backend /app/vendor/ /app/vendor/

# --- PERBAIKAN UTAMA DI SINI ---
# 1. Pastikan folder framework yang dibutuhkan Laravel tersedia
RUN mkdir -p storage/framework/views \
    storage/framework/cache \
    storage/framework/sessions \
    bootstrap/cache

# 2. Buat database dummy SQLite secara fisik
RUN touch database/database.sqlite

# 3. Suntikkan konfigurasi langsung ke file .env agar Laravel tidak mencoba mencari MySQL
RUN cp .env.example .env \
    && sed -i 's/DB_CONNECTION=.*/DB_CONNECTION=sqlite/' .env \
    && sed -i 's/DB_DATABASE=.*/DB_DATABASE=\/app\/database\/database.sqlite/' .env \
    && echo "APP_KEY=base64:9aC/G5X6+Yq7Z4T0O2P3Q1R4S5T6U7V8W9X0Y1Z2A3B=" >> .env \
    && echo "APP_ENV=production" >> .env

# 4. TESTING BOOT: Jika ini gagal, kita akan melihat error PHP aslinya di terminal!
RUN php artisan about

# 5. Jalankan Vite Build
RUN npm run build

# ==========================================
# STAGE 3: Final Production Image
# ==========================================
FROM base AS production

RUN apk add --no-cache nginx supervisor

RUN sed -i 's/user nginx;/user www-data;/g' /etc/nginx/nginx.conf \
    && rm /etc/nginx/http.d/default.conf

WORKDIR /var/www

COPY . .
COPY --from=backend /app/vendor/ /var/www/vendor/
COPY --from=frontend /app/public/build/ /var/www/public/build/

COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 /var/www/storage \
    && chmod -R 775 /var/www/bootstrap/cache \
    && chown -R www-data:www-data /var/lib/nginx \
    && chown -R www-data:www-data /var/log/nginx \
    && chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["entrypoint.sh"]