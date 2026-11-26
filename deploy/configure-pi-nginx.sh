#!/usr/bin/env bash
# Runs on the Raspberry Pi as root. Installs the nginx vhost, images and the
# long Basic Auth password, issues a Let's Encrypt certificate and reloads nginx.
#
# Usage: sudo bash deploy/configure-pi-nginx.sh /path/to/pairly.htpasswd
set -euo pipefail

BASE_PATH="${NEXT_BASE_PATH:-/mp-7f3a9c2e5b8d4106}"
DOMAIN="pairly.space"
PROJECT_DIR="${PROJECT_DIR:-/home/dima/mr-pushkin-league}"
HTPASSWD_SRC="${1:-/tmp/pairly.htpasswd}"
NGINX_AVAILABLE="/etc/nginx/sites-available/pairly"
NGINX_ENABLED="/etc/nginx/sites-enabled/pairly"
IMAGES_DIR="/var/www/pairly/images"

echo "== 1/5 Копирую изображения"
install -d -m 755 /var/www/pairly
rm -rf "$IMAGES_DIR"
cp -R "$PROJECT_DIR/public/images" "$IMAGES_DIR"
find "$IMAGES_DIR" -type d -exec chmod 755 {} +
find "$IMAGES_DIR" -type f -exec chmod 644 {} +

echo "== 2/5 Устанавливаю Basic Auth"
install -o root -g www-data -m 640 "$HTPASSWD_SRC" /etc/nginx/pairly.htpasswd

echo "== 3/5 Включаю HTTP-конфиг для ACME"
install -m 644 "$PROJECT_DIR/deploy/nginx/mrpushkin-http.conf" "$NGINX_AVAILABLE"
ln -sfn "$NGINX_AVAILABLE" "$NGINX_ENABLED"
nginx -t
systemctl reload nginx

echo "== 4/5 Выпускаю сертификат"
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  certbot certonly --webroot -w /var/www/html -d "$DOMAIN" \
    --non-interactive --agree-tos --register-unsafely-without-email
else
  echo "Сертификат уже существует"
fi

echo "== 5/5 Включаю HTTPS-конфиг с секретным путём"
sed "s#__BASE_PATH__#${BASE_PATH}#g" \
  "$PROJECT_DIR/deploy/nginx/mrpushkin.conf.template" > "$NGINX_AVAILABLE"
nginx -t
systemctl reload nginx

echo "Готово: https://$DOMAIN$BASE_PATH/"
