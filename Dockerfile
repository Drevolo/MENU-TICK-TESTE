FROM php:8.2-apache

RUN docker-php-ext-install pdo_sqlite
RUN a2enmod rewrite

COPY . /var/www/html/

RUN chmod -R 755 /var/www/html/data

EXPOSE 80
