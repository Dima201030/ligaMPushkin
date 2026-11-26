# Деплой на Raspberry Pi 5

Текущая площадка: Raspberry Pi 5 (8 ГБ), `rpi58`, публичный адрес `91.223.89.199`.
Публичный сайт — `pairly.space`, API и кабинет организатора — `tournaments.pairly.space`.

На Pi уже работает nginx на 80/443 (другие проекты), поэтому приложение не занимает
эти порты: контейнер слушает `127.0.0.1:3010`, а nginx проксирует на него секретный
путь. Caddy из первоначального плана на этой машине не используется — порты заняты.

## Схема

```
интернет
  └─ 80/443 → nginx (host)
       ├─ /.well-known/acme-challenge/ → certbot webroot
       ├─ /images/                    → /var/www/pairly/images
       ├─ /__BASE_PATH__/             → 127.0.0.1:3010 (Basic Auth)
       └─ всё остальное               → 404
            └─ Docker: pairly-web (Next.js standalone)
```

Доступ закрыт двумя слоями:

1. Basic Auth на весь домен, длинный пароль (файл `/etc/nginx/pairly.htpasswd`).
2. Секретный префикс пути: без него сайт отдаёт 404.

Параметры доступа хранятся только на машине разработчика в `.env.deploy`
(в git не попадает) и в переписке с владельцем.

## Переменные

`NEXT_BASE_PATH` — секретный префикс, например `/mp-xxxxxxxxxxxxxxxx`.
Он вшивается в сборку Next.js (`basePath`), поэтому меняется только пересборкой.

```bash
cp .env.example .env.deploy   # заполнить значения
```

## Обновление приложения

```bash
./deploy/deploy-pi.sh
```

Скрипт копирует проект на Pi (без `node_modules`, `.next`, `.git`), собирает
Docker-образ и перезапускает контейнер. Секретный путь передаётся в сборку из
`.env.deploy`.

## Первичная настройка nginx / сертификата

Выполняется на Pi от root (пароль sudo нужен один раз):

```bash
sudo NEXT_BASE_PATH=/mp-xxxxxxxxxxxxxxxx \
  bash deploy/configure-pi-nginx.sh /tmp/pairly.htpasswd
```

Скрипт:

- копирует изображения в `/var/www/pairly/images`;
- ставит htpasswd в `/etc/nginx/pairly.htpasswd`;
- включает HTTP-конфиг для ACME и выпускает сертификат Let's Encrypt;
- включает HTTPS-конфиг с секретным путём и перезагружает nginx.

Обновить пароль:

```bash
openssl passwd -apr1 'НОВЫЙ_ПАРОЛЬ'        # локально
printf 'pairly:%s\n' '<hash>' > /tmp/pairly.htpasswd
scp /tmp/pairly.htpasswd dima@91.223.89.199:/tmp/
ssh dima@91.223.89.199 'sudo install -o root -g www-data -m 640 /tmp/pairly.htpasswd /etc/nginx/pairly.htpasswd && sudo systemctl reload nginx'
```

## Домены

Публичный сайт — `pairly.space`, API и кабинет организатора — `tournaments.pairly.space`.
Домены уже указывают на публичный IP. Если IP сменится, обновить A-записи у регистратора.
Для смены домена нужен токен аккаунта у регистратора: создать новые записи,
затем повторить выпуск сертификата и поправить `server_name` в nginx-конфиге.

## Проверка

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://pairly.space/            # 404
curl -s -o /dev/null -w '%{http_code}\n' https://pairly.space/__BASE_PATH__/  # 401
curl -u pairly:<PASSWORD> -s -o /dev/null -w '%{http_code}\n' \
  https://pairly.space/__BASE_PATH__/                                     # 200
```

## API proxy (`/api/`)

Шаблон nginx проксирует `__BASE_PATH__/api/` на Go API `127.0.0.1:3020`.
Локальная разработка и переменные — в `docs/LOCAL_API.md`.

## Ограничения текущего прототипа

- Публичные турниры/рейтинг ещё из mock; auth уже на Go API (см. `docs/LOCAL_API.md`).
- Basic Auth — временная защита на время разработки, не замена ролям и 2FA.
- Сертификат продлевается certbot.timer; HTTP-блок с ACME-путём оставлен включённым.

## Поддомен tournaments.pairly.space

Параллельно с duckdns: тот же UI (`127.0.0.1:3010`) и API (`:3020`), тот же
`/etc/nginx/mrpushkin.htpasswd`. DuckDNS-vhost не трогаем.

```bash
# DNS у REG.RU: A-запись tournaments.pairly.space → 91.223.89.199
sudo bash deploy/configure-tournaments-pairly-space.sh
```

Публичный URL клуба: `https://tournaments.pairly.space/mp-7f3a9c2e5b8d4106/`  
Корень поддомена редиректит на этот basePath.  
`pairly.space/tournaments` → `NEXT_PUBLIC_LIGA_PUBLIC_BASE` (pairly-web).
