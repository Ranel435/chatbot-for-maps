# Архитектура MapBot

## Компоненты

### API Layer
- **REST** (chi): `/api/v1/*` - порт 8080
- **gRPC**: SearchService, RouteService - порт 9090

### Services
- **IntentClassifier**: определение типа запроса (regexp + keywords)
- **SearchService**: поиск POI (PostGIS + Qdrant)
- **RoutingService**: построение маршрутов (OSRM)
- **ResponseGenerator**: шаблонные ответы
- **CacheManager**: кэширование (Redis)

### Data Layer
- **PostgreSQL + PostGIS**: основное хранилище POI
- **Qdrant**: векторный поиск
- **Redis**: кэширование

### External Services
- **OSRM**: маршрутизация
- **Embedding Service**: Python sidecar для эмбеддингов

## Масштабирование

- Горизонтальное масштабирование Go-сервисов
- Read replicas для PostgreSQL
- Sharding для Qdrant
- Redis Cluster
