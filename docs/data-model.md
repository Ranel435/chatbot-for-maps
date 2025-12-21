# Data Model

## PostgreSQL

### poi
Основная таблица точек интереса.

| Колонка | Тип | Описание |
|---------|-----|----------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Название |
| description | TEXT | Описание |
| location | GEOGRAPHY | Координаты (PostGIS) |
| category | VARCHAR(50) | Категория |
| subcategory | VARCHAR(50) | Подкатегория |
| tags | JSONB | Теги |
| historical_period | VARCHAR(100) | Исторический период |
| year_built | INTEGER | Год постройки |
| source | VARCHAR(20) | Источник (osm/manual) |
| osm_id | BIGINT | ID в OSM |
| popularity_score | FLOAT | Рейтинг популярности |

### categories
Иерархия категорий.

| Колонка | Тип | Описание |
|---------|-----|----------|
| id | VARCHAR(50) | ID категории |
| name_ru | VARCHAR(100) | Название (RU) |
| name_en | VARCHAR(100) | Название (EN) |
| parent_id | VARCHAR(50) | Родительская категория |
| osm_tags | JSONB | Маппинг на OSM теги |

## Qdrant

Collection: `poi`
- Vector size: 384
- Distance: Cosine

Payload:
- poi_id: uuid
- name: keyword
- category: keyword
- lat, lng: float
- popularity: float

## Категории

```
religious/
├── church (церкви)
├── monastery (монастыри)
├── cathedral (соборы)
└── chapel (часовни)

military/
├── fortress (крепости)
├── bunker (бункеры)
├── memorial (мемориалы)
└── battlefield (поля сражений)

architecture/
├── manor (усадьбы)
├── palace (дворцы)
├── tower (башни)
└── ruins (руины)

trails/
├── war_path (тропы ВОВ)
├── trade_route (торговые пути)
└── pilgrimage (паломничество)
```



