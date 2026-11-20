#!/usr/bin/env bash
# Builds and deploys the current working copy to the Raspberry Pi.
# Reads secrets from .env.deploy (not committed).
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env.deploy ]; then
  # shellcheck disable=SC1091
  set -a && . ./.env.deploy && set +a
fi

: "${NEXT_BASE_PATH:?Set NEXT_BASE_PATH in .env.deploy}"
HOST="${PI_HOST:-dima@91.223.89.199}"
DIR="${PI_DIR:-/home/dima/mr-pushkin-league}"

echo "== Синхронизация исходников"
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .git \
  --exclude '.env.deploy' --exclude 'tsconfig.tsbuildinfo' --exclude '.DS_Store' \
  ./ "$HOST:$DIR/"

echo "== Сборка образа на Pi"
ssh "$HOST" "cd '$DIR' && printf 'NEXT_BASE_PATH=%s\n' '$NEXT_BASE_PATH' > .env && docker compose build"

echo "== Перезапуск (restart: unless-stopped)"
ssh "$HOST" "cd '$DIR' && docker compose up -d && docker compose ps"

echo "Готово: https://mrpushkin.duckdns.org$NEXT_BASE_PATH/"
