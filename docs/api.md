# API Reference

## REST API

Base URL: `http://localhost:8080`

### POST /api/v1/search

Поиск POI по запросу.

**Request:**
```json
{
  "query": "старые церкви",
  "categories": ["church", "cathedral"],
  "lat": 55.7558,
  "lng": 37.6173,
  "radius_km": 10,
  "limit": 20,
  "offset": 0
}
```

**Response:**
```json
{
  "pois": [...],
  "total": 42,
  "query": "старые церкви",
  "took_ms": 15
}
```

### POST /api/v1/chat

Чат-интерфейс с определением интента.

**Request:**
```json
{
  "query": "построй маршрут по усадьбам",
  "location": {"lat": 55.7558, "lng": 37.6173}
}
```

**Response:**
```json
{
  "intent": "ROUTE",
  "message": "Маршрут готов: 12.5 км",
  "data": {...}
}
```

### POST /api/v1/route

Построение маршрута по координатам.

**Request:**
```json
{
  "start": {"lat": 55.7558, "lng": 37.6173},
  "end": {"lat": 55.8, "lng": 37.7},
  "waypoints": [],
  "mode": "driving"
}
```

### POST /api/v1/route/query

Построение маршрута по текстовому запросу.

**Request:**
```json
{
  "query": "монастыри",
  "start": {"lat": 55.7558, "lng": 37.6173},
  "mode": "walking",
  "limit": 5
}
```

### GET /api/v1/poi/{id}

Получение информации о POI.

### GET /api/v1/categories

Список категорий.

## Типы интентов

- `SEARCH` - поиск мест
- `ROUTE` - построение маршрута
- `INFO` - информация о месте
- `CATEGORY_LIST` - список категорий

## Режимы транспорта

- `walking` - пешком
- `driving` - на машине
- `cycling` - на велосипеде



