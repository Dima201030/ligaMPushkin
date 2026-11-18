# Архитектура лиги Mr. Pushkin

**Статус:** целевое состояние, ревизия 3 от 18.11.2026.
**Область:** публичный сайт (Next.js), API (Go), PostgreSQL, деплой и эксплуатация.

> **Текущее состояние (ноябрь 2026).** Auth (этап 3) на Go API: register/login/logout/me,
> cookie-сессии, заявки организатора. Публичные данные турниров/рейтинга ещё из
> `src/lib/mock`. Документ описывает целевое состояние после **D-017**. Деплой UI на Pi
> (Docker + nginx); API локально/compose на `:3020`, прокси `/api/` — см. `docs/LOCAL_API.md`.
> Только взрослый теннис. Один клуб (D-018).

---

## 1. Контекст и цели

Клуб получает готовую систему лиги с сопровождением. Код, база и файлы принадлежат
разработчику. Архитектура не зависит от BaaS и переносится с Raspberry Pi 5 на
Selectel без переписывания домена.

Цели:

1. **Свой Go-сервер.** Auth, RBAC, домен и мутации — в API на Go.
2. **Безопасность сначала.** TLS снаружи, пароли только как Argon2id-хэш, секреты
   шифруются, сессии отзывные.
3. **UI отдельно.** Next.js отдаёт интерфейс и не ходит в Postgres.
4. **Работа на Pi 5 / 8 ГБ.** Compose: `web` + `api` + `db`.
5. **Один клуб.** Без мультитенантности.

---

## 2. Ключевые решения

| № | Решение | Альтернатива | Почему так |
|---|---|---|---|
| 1 | API на Go, UI на Next.js | Всё в Next.js; API на C++ | Свой сервер, контроль crypto/auth; C++ избыточен; Next остаётся сильным UI |
| 2 | PostgreSQL 17 | SQLite, MySQL | Транзакции, ограничения, окна для рейтинга |
| 3 | sqlc + goose + pgx | Drizzle/Prisma в Node; GORM | Явный SQL, типы из запросов, лёгкий рантайм |
| 4 | Argon2id + серверные сессии | JWT в localStorage; plaintext/`==` | XSS не крадёт токен из JS; пароль никогда не сравнивается строкой |
| 5 | TLS на nginx; Go на localhost | TLS внутри Go наружу | На Pi 80/443 уже у nginx; меньше дыр |
| 6 | AES-256-GCM для секретов в БД | Plaintext TOTP | Ключ только в env |
| 7 | Роли player → … → superadmin | Один admin | Сопровождение ≠ владелец клуба |
| 8 | Один клуб | Мультитенантность | D-018 |
| 9 | Онлайн-оплата не входит | ЮKassa | Вне системы |

---

## 3. Схема системы

```text
Интернет
   │
   └── 443 TLS 1.2+ (Let's Encrypt) → nginx (host)
            ├── /.well-known/acme-challenge/
            ├── /images/*              → /var/www/mrpushkin/images
            ├── /<secret>/api/*        → Go API  127.0.0.1:3020
            ├── /<secret>/*            → Next.js 127.0.0.1:3010
            └── иначе                  → 404
               (+ Basic Auth на время разработки)

Docker network (внутренняя)
   ├── web      Next.js standalone, :3000 → host 3010
   ├── api      Go API, :8080 → host 3020
   ├── db       PostgreSQL 17, порт наружу не публикуется
   ├── migrate  goose (одноразово до api)
   └── backup   pg_dump + uploads → age → rclone
```

Правило периметра: Postgres и Go не слушают публичный интерфейс. Снаружи только nginx.

---

## 4. Стек

| Слой | Технология | Комментарий |
|---|---|---|
| UI | Next.js 16, React 19, Tailwind 4, Lucide | Уже в репозитории |
| API | Go 1.23+, chi, стандартный `net/http` | Один бинарник, arm64 |
| БД | PostgreSQL 17 | `citext`, `pgcrypto` |
| Доступ к БД | pgx + sqlc + goose | Миграции — чистый SQL |
| Пароли | Argon2id (`golang.org/x/crypto/argon2`) | Параметры в PHC-строке хэша |
| Секреты в БД | AES-256-GCM | Ключ `APP_ENCRYPTION_KEY` |
| Сессии | crypto/rand → cookie; SHA-256 в БД | HttpOnly + Secure |
| Почта | SMTP из Go + `email_outbox` | |
| Файлы | позже; превью через imaging/lib | Этап контента |
| Тесты | Go `testing` + Playwright на UI | |
| Деплой | Compose, nginx, certbot, DuckDNS | |

---

## 5. Структура репозитория (целевая)

```text
src/                          # Next.js UI
  app/ (public) (auth) cabinet organizer
  components/ lib/
server/                       # Go API
  cmd/api/main.go
  internal/
    config/
    crypto/                   # Argon2id, AES-GCM, random, token hash
    auth/                     # password verify, session, rbac
    http/                     # router, middleware, handlers
    domain/                   # сервисы по мере этапов
    db/                       # pgx pool, sqlc generated
  migrations/                 # goose
  sql/                        # sqlc queries
deploy/
compose.yml                   # web + api + db
docs/
```

Правило: UI не импортирует SQL и не держит пароли. Клиент ходит в `/api` через
`src/lib/api/auth.ts` (localStorage-аккаунты удалены).

---

## 6. Криптография и пароли

### 6.1 Пароли — только хэш

- Хранение: Argon2id (рекомендуемые параметры OWASP: memory ≥ 19 MiB, iterations ≥ 2,
  parallelism 1; параметры кодируются в строке хэша).
- Проверка: только verify против хэша (constant-time). **Запрещено:**
  `password == stored`, сравнение plaintext, клиентский «хеш как пароль».
- Минимум 10 символов, блокlist популярных, запрет email в пароле.
- Хэш никогда не логируется и не отдаётся в API.
- Смена пароля отзывает все сессии, кроме текущей (или все — по политике).

### 6.2 Канал

- Снаружи: HTTPS, HSTS после стабильного TLS.
- Внутри Docker: API ↔ DB без публикации портов БД.
- Cookie сессии: `HttpOnly`, `Secure` (prod), `SameSite=Lax`, `Path=/`, без `Domain`;
  имя в production `__Host-mpl_session`.

### 6.3 Сессии

- 32 байта из `crypto/rand` → cookie.
- В БД хранится только SHA-256(token).
- Срок: абсолютный 30 дней, idle 7 дней.
- Отзыв: logout, смена пароля, блокировка, админский revoke.

### 6.4 Шифрование секретов приложения

- `APP_ENCRYPTION_KEY` — 32 байта, только env, не в git.
- TOTP-секреты и аналоги — AES-256-GCM (nonce уникальный на запись).
- Бэкапы: `age` перед offsite.

### 6.5 Защита входа

- Rate limit: 5 неудач / 15 мин на IP+email; глобальный лимит на IP.
- Ответы не раскрывают, существует ли email.
- Время ответа выравнивается против user-enumeration.

---

## 7. Авторизация (продуктовый поток)

1. Регистрация: имя, фамилия, email, пароль, уровень → `pending`.
2. Подтверждение email по ссылке (токен: random, в БД хэш).
3. Организатор в `/organizer/applications` правит ФИО/уровень → `approved` / `rejected`.
4. Вход разрешён только при `approved` (+ verified email).
5. Роли: `player < organizer < owner < superadmin`. UI не защита.

Матрица прав и правила superadmin — без изменений по смыслу (см. прежние разделы
ролей в плане MVP): проверки только в Go middleware / сервисах.

---

## 8. Безопасность API

- Deny by default: каждый мутирующий маршрут — сессия + роль.
- Валидация входа на границе HTTP.
- Только параметризованный SQL (sqlc/pgx).
- CSRF: SameSite + проверка Origin для state-changing запросов.
- CSP/HSTS/nosniff на nginx + заголовки API.
- Секреты только в env; `.env.deploy` не в git и не в ответах агентов.
- Аудит append-only.

---

## 9. Данные (набросок)

```text
users, profiles, sessions, verification_tokens,
login_attempts, audit_log, email_outbox, consent_log
— этап безопасного фундамента и auth

tournaments, registrations, matches, match_sides,
rankings, news, events, files
— последующие этапы roadmap
```

Один клуб: без `club_id`. Время в БД — `timestamptz` UTC.

---

## 10. Интеграция UI ↔ API

- Браузер → same-origin `/api/...` (через nginx и секретный префикс, пока он есть).
- Next.js `src/lib/data` постепенно переключается с mock на HTTP-клиент к Go
  (серверные fetch в RSC или клиент для форм auth).
- Не дублировать бизнес-правила в TypeScript: источник правды — Go.

---

## 11. Почта

- SMTP (465/587) провайдера; порт 25 на Pi часто закрыт.
- Очередь `email_outbox` в Postgres, worker в Go.
- Шаблоны: verify email, approve/reject, reset password, позже матчи.

---

## 12. Деплой на Raspberry Pi 5

- UI уже: Docker Next на `127.0.0.1:3010`, nginx, LE, Basic Auth, секретный путь.
- Добавить: `db`, `api` на `127.0.0.1:3020`, location `/api/` в nginx.
- Миграции goose до старта api.
- Health: `GET /api/health` (без секретов).
- Сборка Go и Next — желательно CI `linux/arm64`, не в пик турнира на Pi.
- Подробности текущего UI-деплоя: `docs/DEPLOY.md` (обновить при появлении api).

---

## 13. Бэкапы

- Ежедневно: `pg_dump` + uploads → `age` → offsite.
- RPO 24 ч, RTO 2 ч; учебный restore раз в месяц.

---

## 14. Переезд на Selectel

Тот же compose (`web` + `api` + `db`), restore дампа, DNS. Код домена не переписывается.

---

## 15. Тестирование

- Go unit: crypto (hash/verify), rbac, токены.
- Integration: auth flow на тестовой БД.
- Playwright: регистрация → pending → approve → login.
- Security: нет plaintext password path; rate limit; CSRF/Origin.

---

## 16. Открытые вопросы

1. SMTP-провайдер и домен отправителя.
2. Коэффициенты рейтинга (этап рейтинга).
3. Юртексты и оператор ПД.
4. SLA сопровождения.
5. Владение доменом/брендом после договора.
