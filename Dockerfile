FROM php:8.2-apache

# Habilita extensão SQLite via PDO (já compilada no PHP oficial)
RUN docker-php-ext-enable pdo_sqlite

RUN a2enmod rewrite

COPY . /var/www/html/

RUN mkdir -p /var/www/html/data && \
    chown -R www-data:www-data /var/www/html/data && \
    chmod -R 755 /var/www/html/data

EXPOSE 80
