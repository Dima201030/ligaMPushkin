#!/usr/bin/env bash
# Builds and deploys the current working copy to the Raspberry Pi.
# Reads secrets from .env.deploy (not committed).
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env.deploy ]; then
  # shellcheck disable=SC1091
  set -a && . ./.env.deploy && set +a
fi

# NEXT_BASE_PATH may be empty (serve club UI at /).
NEXT_BASE_PATH="${NEXT_BASE_PATH-}"
HOST="${PI_HOST:-dima@91.223.89.199}"
DIR="${PI_DIR:-/home/dima/mr-pushkin-league}"

SITE_URL="${NEXT_PUBLIC_SITE_URL:-${PUBLIC_URL:-https://tournaments.pairly.space/}}"
PUBLIC_URL="${PUBLIC_URL:-$SITE_URL}"

# Optional operator legal fields (NEXT_PUBLIC_* baked at image build).
OPERATOR_NAME="${NEXT_PUBLIC_OPERATOR_NAME:-}"
OPERATOR_INN="${NEXT_PUBLIC_OPERATOR_INN:-}"
OPERATOR_EMAIL="${NEXT_PUBLIC_OPERATOR_EMAIL:-}"
OPERATOR_ADDRESS="${NEXT_PUBLIC_OPERATOR_ADDRESS:-}"
OPERATOR_RKN_NOTICE="${NEXT_PUBLIC_OPERATOR_RKN_NOTICE:-}"

echo "== Синхронизация исходников"
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .git \
  --exclude '.env.deploy' --exclude 'tsconfig.tsbuildinfo' --exclude '.DS_Store' \
  ./ "$HOST:$DIR/"

# nginx serves /images/ from a static alias (not the Next container).
IMAGES_DIR="${PI_IMAGES_DIR:-/var/www/mrpushkin/images}"
echo "== Синхронизация /images → $IMAGES_DIR"
ssh "$HOST" "sudo mkdir -p '$IMAGES_DIR' && sudo rsync -a --delete '$DIR/public/images/' '$IMAGES_DIR/' && sudo find '$IMAGES_DIR' -type d -exec chmod 755 {} + && sudo find '$IMAGES_DIR' -type f -exec chmod 644 {} +"

echo "== Сборка образа на Pi"
# Quote values so names with spaces survive `source`/compose .env parsing.
# shellcheck disable=SC2087
ssh "$HOST" "cd '$DIR' && cat > .env <<'ENVEOF'
NEXT_BASE_PATH=${NEXT_BASE_PATH}
PUBLIC_URL=${PUBLIC_URL}
NEXT_PUBLIC_SITE_URL=${SITE_URL}
NEXT_PUBLIC_OPERATOR_NAME='${OPERATOR_NAME}'
NEXT_PUBLIC_OPERATOR_INN='${OPERATOR_INN}'
NEXT_PUBLIC_OPERATOR_EMAIL='${OPERATOR_EMAIL}'
NEXT_PUBLIC_OPERATOR_ADDRESS='${OPERATOR_ADDRESS}'
NEXT_PUBLIC_OPERATOR_RKN_NOTICE='${OPERATOR_RKN_NOTICE}'
ENVEOF
docker compose build"

echo "== Перезапуск (restart: unless-stopped)"
ssh "$HOST" "cd '$DIR' && docker compose up -d && docker compose ps"

PUBLIC_PATH="${NEXT_BASE_PATH:-}"
echo "Готово: https://tournaments.pairly.space${PUBLIC_PATH}/"
