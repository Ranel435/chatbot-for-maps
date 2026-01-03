# MapBot

Бэкенд для поиска и построения туристических маршрутов с упором на исторические объекты Москвы и МО. Семантический поиск на Qdrant, маршрутизация через OSRM, данные из OSM (Overpass).
Фронтенд есть, но vibecodded(

## Архитектура
- API: REST (8080) и gRPC (9090). Метрики Prometheus на API и embedding.
- Поиск: семантический (Qdrant + embedding-service) с фолбэком на текстовый поиск PostgreSQL/PostGIS.
- Маршруты: OSRM.
- Кэш: Redis (не обязателен для запуска, но поддержан).

## Ключевые сервисы
- mapbot-api — HTTP/gRPC, бизнес-логика, текстовый/семантический поиск, маршруты.
- embedding-service (Python, sentence-transformers) — gRPC эмбеддинги; загрузка модели может занимать 1–3+ минут.
- qdrant — векторное хранилище (collection `poi`, vector size 384, cosine).
- postgres (PostGIS) — POI, категории, факты; миграции в `migrations/`.
- importer — вытягивает POI из Overpass и индексирует в Postgres + Qdrant (с ретраями 504/429).

## Поведение поиска
- При ошибке/пустом ответе Qdrant — автоматический фолбэк на текстовый поиск.
- Если семантических результатов мало, досмешиваются текстовые (без дублей, до 50).

## Данные и импорты
- Источник: OSM Overpass (bbox Москва/МО). Типы: `churches`, `memorials`, `historic`.
- Импорт: батчи 50, после Postgres сразу индексация в Qdrant. Ретраи Overpass: 5 попыток, 15s бэкофф.

## Конфигурация (важное)
- `DATABASE_URL` / `POSTGRES_URL` — Postgres/PostGIS.
- `QDRANT_URL` или хост/порт для Qdrant.
- `EMBEDDING_GRPC_ADDR` (или `EMBEDDING_URL`) — адрес embedding gRPC.
- `OSRM_URL` — точка OSRM.
- Переменные портов API: `HTTP_PORT`, `GRPC_PORT`.

## Health и готовность
- API: `/health`.
- Embedding: readiness после загрузки модели (важно для оркестрации, не привязывать старт API к его readiness — в API есть ретраи до 5 минут).
- Qdrant: стандартный health на `:6333`.

## Категории POI
- Религиозные: церкви, монастыри, соборы, часовни.
- Военные: крепости, бункеры, мемориалы.
- Архитектура: усадьбы, дворцы, башни, руины.

## Наблюдаемость
- Prometheus: scrape API и embedding; метрики доступны по `/metrics` (API) и gRPC/логам embedding.

## Структура
```
cmd/              # server, importer
internal/         # api, service, repository, infrastructure, config
pkg/              # osm client, embedding client
embedding-service/# python gRPC embeddings
migrations/       # SQL миграции
configs/          # YAML
```