# Локальный Go API для UI

Бэкенд лиги (репозиторий `ligaBackend`) по умолчанию слушает **http://127.0.0.1:3020**.

## Разработка UI

1. Запустите API с Postgres (`docker compose up -d` в `ligaBackend`, порт **3020**).
2. Запустите Next: `npm run dev` (порт 3000).

В `next.config.ts` rewrite **`/api/*` → `API_PROXY_TARGET`** (по умолчанию `http://127.0.0.1:3020`). Браузер ходит на тот же origin, куки сессии работают через `credentials: 'include'`.

Переменные:

| Переменная | Назначение |
|------------|------------|
| `API_PROXY_TARGET` | URL Go API для dev-rewrite |
| `NEXT_BASE_PATH` | секретный префикс сборки (Pi) |
| `NEXT_PUBLIC_BASE_PATH` | выставляется автоматически из `NEXT_BASE_PATH` для `fetch` в клиенте |

Клиент собирает URL как `` `${NEXT_PUBLIC_BASE_PATH}/api/...` `` — с префиксом на Pi и без него локально.

Турниры (этап 4): публичные `GET /api/tournaments`, `GET /api/tournaments/{slug}`;
заявки `POST/DELETE …/registrations`; organizer CRUD под `/api/organizer/tournaments`.
UI-экраны календаря, карточки и organizer tournaments читают API (не mock).

## Деплой на Pi

- UI в Docker: **127.0.0.1:3010**, префикс `NEXT_BASE_PATH`.
- API на хосте: **127.0.0.1:3020**.
- В nginx (`deploy/nginx/mrpushkin.conf.template`) location **`^~ __BASE_PATH__/api/`** проксирует API отдельно от Next, с передачей cookies.

После смены шаблона nginx на Pi: `deploy/configure-pi-nginx.sh` и `sudo nginx -t && sudo systemctl reload nginx`.