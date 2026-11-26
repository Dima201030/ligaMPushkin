#!/usr/bin/env bash
# Install nginx vhost for tournaments.pairly.space → same club UI (:3010)
# and API (:3020) as duckdns, with the same Basic Auth htpasswd.
# Does NOT modify the mrpushkin.duckdns.org site.
#
# Usage (on Pi as root):
#   sudo bash deploy/configure-tournaments-pairly-space.sh
#
# Prerequisites:
#   - DNS A: tournaments.pairly.space → 91.223.89.199
#   - /etc/nginx/mrpushkin.htpasswd already installed
set -euo pipefail

BASE_PATH="${NEXT_BASE_PATH:-/mp-7f3a9c2e5b8d4106}"
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

echo "== 1/4 HTTP vhost (ACME) for $DOMAIN"
install -m 644 "$HTTP_CONF" "$NGINX_AVAILABLE"
ln -sfn "$NGINX_AVAILABLE" "$NGINX_ENABLED"
nginx -t
systemctl reload nginx

echo "== 2/4 Let's Encrypt for $DOMAIN"
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

echo "== 3/4 HTTPS vhost (same Basic Auth + :3010/:3020)"
sed "s#__BASE_PATH__#${BASE_PATH}#g" "$HTTPS_TMPL" > "$NGINX_AVAILABLE"
nginx -t
systemctl reload nginx

echo "== 4/4 Done"
echo "Club UI: https://$DOMAIN$BASE_PATH/"
echo "DuckDNS left unchanged (parallel)."
