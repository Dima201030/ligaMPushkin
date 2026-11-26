#!/usr/bin/env bash
# Install nginx vhost for tournaments.pairly.space → club UI (:3010)
# and API (:3020). Club UI is served at domain root (empty NEXT_BASE_PATH).
# Legacy /mp-* paths get a permanent redirect to the same path without prefix.
# Does NOT modify the mrpushkin.duckdns.org site.
#
# Usage (on Pi as root):
#   sudo bash deploy/configure-tournaments-pairly-space.sh
#
# Prerequisites:
#   - DNS A: tournaments.pairly.space → 91.223.89.199
#   - /etc/nginx/mrpushkin.htpasswd already installed (optional; BA commented out)
set -euo pipefail

DOMAIN="tournaments.pairly.space"
PROJECT_DIR="${PROJECT_DIR:-/home/dima/mr-pushkin-league}"
NGINX_AVAILABLE="/etc/nginx/sites-available/tournaments-pairly-space"
NGINX_ENABLED="/etc/nginx/sites-enabled/tournaments-pairly-space"
HTPASSWD="/etc/nginx/mrpushkin.htpasswd"
HTTP_CONF="$PROJECT_DIR/deploy/nginx/tournaments-pairly-space-http.conf"
HTTPS_TMPL="$PROJECT_DIR/deploy/nginx/tournaments-pairly-space.conf.template"

if [[ ! -f "$HTPASSWD" ]]; then
  echo "Missing $HTPASSWD — install duckdns Basic Auth first." >&2
  exit 1
fi
if [[ ! -f "$HTTP_CONF" || ! -f "$HTTPS_TMPL" ]]; then
  echo "Missing nginx templates under $PROJECT_DIR/deploy/nginx/" >&2
  exit 1
fi

echo "== 1/5 HTTP vhost (ACME) for $DOMAIN"
install -m 644 "$HTTP_CONF" "$NGINX_AVAILABLE"
ln -sfn "$NGINX_AVAILABLE" "$NGINX_ENABLED"
nginx -t
systemctl reload nginx

echo "== 2/5 Let's Encrypt for $DOMAIN"
if [[ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]]; then
  if ! certbot certonly --webroot -w /var/www/html -d "$DOMAIN" \
    --non-interactive --agree-tos --register-unsafely-without-email; then
    echo "Certbot failed (DNS/firewall?). HTTP ACME vhost is live — re-run after DNS A → 91.223.89.199." >&2
  fi
else
  echo "Certificate already exists"
fi

if [[ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]]; then
  echo "No certificate yet — left HTTP-only ACME vhost. Add DNS A → 91.223.89.199 and re-run." >&2
  exit 2
fi

echo "== 3/5 Sync public images for /images/ alias"
IMAGES_DIR="/var/www/mrpushkin/images"
install -d -m 755 /var/www/mrpushkin
rm -rf "$IMAGES_DIR"
cp -R "$PROJECT_DIR/public/images" "$IMAGES_DIR"
find "$IMAGES_DIR" -type d -exec chmod 755 {} +
find "$IMAGES_DIR" -type f -exec chmod 644 {} +

echo "== 4/5 HTTPS vhost (club UI at /, API at /api, legacy /mp-* → 301)"
install -m 644 "$HTTPS_TMPL" "$NGINX_AVAILABLE"
nginx -t
systemctl reload nginx

echo "== 5/5 Done"
echo "Club UI: https://$DOMAIN/"
echo "Legacy redirect: https://$DOMAIN/mp-7f3a9c2e5b8d4106/ → https://$DOMAIN/"
echo "DuckDNS left unchanged (parallel)."
