# MapBot

**MapBot** — сервис для поиска туристических точек интереса и построения маршрутов по историческим объектам Москвы и Московской области.

Проект представляет собой многосервисное приложение в монорепозитории и включает:
- frontend;
- backend API;
- отдельный embedding-service для семантического поиска;
- Qdrant для векторного поиска;
- PostgreSQL/PostGIS для хранения данных и текстового fallback-поиска;
- Redis для кэширования;
- OSRM для построения маршрутов;
- Prometheus + Grafana + Alertmanager для мониторинга и алертов.

MapBot поддерживает два режима запуска:
- **локальная разработка** через `docker compose`;
- **развёртывание в Kubernetes** с ingress, TLS, мониторингом и алертингом.

## Возможности
- поиск исторических и туристических объектов по пользовательскому запросу;
- семантический поиск через эмбеддинги и Qdrant;
- fallback на текстовый поиск через PostgreSQL/PostGIS;
- построение маршрутов через OSRM;
- импорт данных из OpenStreetMap через Overpass API;
- мониторинг backend-сервиса;
- алерты через Alertmanager и Gotify.

## Архитектура

### Основные компоненты
#### Frontend
Пользовательский веб-интерфейс. Отправляет запросы в backend и отображает результаты поиска и маршруты.
#### Backend (`mapbot-api`)
Основной сервис с бизнес-логикой:
- принимает HTTP-запросы;
- отдаёт HTTP- и gRPC-интерфейсы;
- обращается к embedding-service по gRPC;
- выполняет семантический поиск в Qdrant;
- использует PostgreSQL/PostGIS как fallback для текстового поиска;
- обращается к OSRM для построения маршрутов;
- экспортирует метрики Prometheus;
- использует readiness/liveness probes.
#### Embedding Service
Отдельный Python-сервис для генерации эмбеддингов пользовательских запросов.
Используется backend-сервисом по gRPC.
#### PostgreSQL / PostGIS
Основное хранилище данных:
- точки интереса;
- категории;
- факты и дополнительные атрибуты;
- текстовый fallback-поиск.
В Kubernetes используется **внешний managed PostgreSQL**, а не база внутри кластера.
#### Qdrant
Векторное хранилище для семантического поиска.
#### Redis
Используется как вспомогательный кэш.
#### OSRM
Сервис маршрутизации для построения маршрутов между точками.
#### Importer
Отдельный компонент для загрузки и индексации данных:
- получает POI из OSM через Overpass API;
- сохраняет данные в PostgreSQL/PostGIS;
- индексирует объекты в Qdrant.
#### Observability stack
- **Prometheus** — сбор метрик;
- **Grafana** — визуализация;
- **Alertmanager** — маршрутизация алертов;
- **Gotify** — получение уведомлений через bridge.

### Основные порты
- frontend: `3000`
- backend HTTP API: `8080`
- backend gRPC: `9090`
- embedding gRPC: `50051`
- PostgreSQL: `5432`
- Redis: `6379`
- Qdrant HTTP: `6333`
- Qdrant gRPC: `6334`
- OSRM: `5001`
- Prometheus: `9092`
- Grafana: `3001`

## Kubernetes deployment
Проект разворачивается в namespace `mapbot` и использует ingress + TLS.
### Что развёрнуто в Kubernetes
В namespace `mapbot`:
- `mapbot-frontend` — Deployment + Service
- `mapbot-backend` — Deployment + Service
- `embedding` — Deployment + Service
- дополнительные инфраструктурные сервисы, включая Qdrant / Redis / OSRM
### Внешний доступ
Внешний трафик проходит через `ingress-nginx`, опубликованный как `LoadBalancer`.
Для frontend настроен Ingress:
- host: `wooork.space`
- TLS через `cert-manager` и `ClusterIssuer`
### TLS
Используется `cert-manager` с `ClusterIssuer` для Let's Encrypt.
### Managed PostgreSQL
PostgreSQL вынесен за пределы кластера и используется как внешний managed-сервис.

## Мониторинг и алерты
Для observability используется `kube-prometheus-stack` (Helm).
### Мониторинг
- backend экспортирует метрики на `/metrics`;
- в Kubernetes настроен `ServiceMonitor`, который собирает метрики backend-сервиса;
- Grafana опубликована через отдельный Ingress на поддомене `grafana.wooork.space`.
### Алерты
- Alertmanager маршрутизирует warning/critical alerts;
- для доставки уведомлений используется `alertmanager-gotify-bridge`;
- конечные уведомления приходят в Gotify.
Это даёт базовый monitoring/alerting-контур поверх приложения.

## Используемые технологии
### Application

- Go Gin
- Python
- JS React
### Data / Search / Routing
- PostgreSQL
- PostGIS
- Qdrant
- Redis
- OSRM
- OpenStreetMap / Overpass API
### Infrastructure
- Docker
- Docker Compose
- Kubernetes
- Nginx-Ingress
- cert-manager
- Helm
### Observability
- Prometheus
- Grafana
- Alertmanager
- Gotify
