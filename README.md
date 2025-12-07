# MapBot

Высоконагруженный backend-сервис для построения туристических маршрутов с фокусом на исторические объекты. 

## Характеристики

- **Target RPS**: 50,000+
- **Регион**: Москва + Московская область
- **API**: REST + gRPC
- **Поиск**: Семантический (Qdrant) + PostgreSQL/PostGIS
- **Маршруты**: OSRM

## API

### REST API (порт 8080)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/v1/search` | Поиск POI |
| POST | `/api/v1/chat` | Чат-интерфейс |
| GET | `/api/v1/poi/{id}` | Получение POI |
| GET | `/api/v1/categories` | Список категорий |
| POST | `/api/v1/route` | Построение маршрута |
| POST | `/api/v1/route/pois` | Маршрут через POI |
| POST | `/api/v1/route/query` | Маршрут по запросу |
| GET | `/health` | Health check |

### gRPC API (порт 9090)

- `SearchService.Search`
- `SearchService.GetPOI`
- `SearchService.GetCategories`
- `RouteService.BuildRoute`
- `HealthService.Check`

## Примеры запросов

### Поиск

```bash
curl -X POST http://localhost:8080/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "старые церкви", "limit": 10}'
```

### Чат

```bash
curl -X POST http://localhost:8080/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "построй маршрут по усадьбам"}'
```

### Маршрут

```bash
curl -X POST http://localhost:8080/api/v1/route/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "монастыри",
    "start": {"lat": 55.7558, "lng": 37.6173},
    "mode": "driving",
    "limit": 5
  }'
```

## Структура проекта

```
mapbot/
├── cmd/
│   ├── server/          # HTTP/gRPC сервер
│   └── importer/        # Импорт данных OSM
├── internal/
│   ├── api/             # REST и gRPC handlers
│   ├── domain/          # Доменные модели
│   ├── service/         # Бизнес-логика
│   ├── repository/      # Работа с БД
│   ├── infrastructure/  # Внешние сервисы
│   └── config/          # Конфигурация
├── pkg/
│   ├── osm/             # Клиент OSM Overpass
│   └── embedding/       # Клиент эмбеддингов
├── embedding-service/   # Python сервис эмбеддингов
├── migrations/          # SQL миграции
└── configs/             # YAML конфиги
```

## Категории POI

- **Религиозные**: церкви, монастыри, соборы, часовни
- **Военные**: крепости, бункеры, мемориалы
- **Архитектура**: усадьбы, дворцы, башни, руины
- **Тропы**: исторические маршруты, тропы ВОВ

## Конфигурация

Переменные окружения:

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| HTTP_PORT | Порт REST API | 8080 |
| GRPC_PORT | Порт gRPC API | 9090 |
| POSTGRES_URL | URL PostgreSQL | postgres://mapbot:mapbot@localhost:5432/mapbot |
| REDIS_URL | URL Redis | localhost:6379 |
| QDRANT_HOST | Хост Qdrant | localhost |
| QDRANT_PORT | Порт Qdrant | 6334 |
| OSRM_URL | URL OSRM | http://localhost:5000 |
| EMBEDDING_URL | URL Embedding service | localhost:50051 |

Сервисы:
- `mapbot-api` - основной сервис
- `postgres` - PostgreSQL + PostGIS
- `redis` - кэширование
- `qdrant` - векторный поиск
- `embedding` - Python сервис эмбеддингов