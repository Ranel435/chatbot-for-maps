-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Основная таблица POI
CREATE TABLE poi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address VARCHAR(500),
    
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    tags JSONB DEFAULT '[]',
    
    historical_period VARCHAR(100),
    year_built INTEGER,
    year_destroyed INTEGER,
    
    source VARCHAR(20) NOT NULL,
    osm_id BIGINT,
    popularity_score FLOAT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_poi_location ON poi USING GIST(location);
CREATE INDEX idx_poi_category ON poi(category);
CREATE INDEX idx_poi_subcategory ON poi(subcategory);
CREATE INDEX idx_poi_tags ON poi USING GIN(tags);
CREATE INDEX idx_poi_source ON poi(source);
CREATE INDEX idx_poi_osm_id ON poi(osm_id);

-- Таблица категорий
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name_ru VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    parent_id VARCHAR(50) REFERENCES categories(id),
    icon VARCHAR(50),
    osm_tags JSONB DEFAULT '[]'
);

CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Ручные исторические данные
CREATE TABLE historical_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poi_id UUID REFERENCES poi(id) ON DELETE CASCADE,
    fact_type VARCHAR(50),
    title VARCHAR(255),
    content TEXT,
    year_from INTEGER,
    year_to INTEGER,
    source_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_historical_facts_poi ON historical_facts(poi_id);
CREATE INDEX idx_historical_facts_type ON historical_facts(fact_type);

-- Начальные категории
INSERT INTO categories (id, name_ru, name_en, parent_id, osm_tags) VALUES
('religious', 'Религиозные объекты', 'Religious', NULL, '[]'),
('church', 'Церкви', 'Churches', 'religious', '["amenity=place_of_worship", "building=church"]'),
('monastery', 'Монастыри', 'Monasteries', 'religious', '["amenity=monastery"]'),
('cathedral', 'Соборы', 'Cathedrals', 'religious', '["building=cathedral"]'),
('chapel', 'Часовни', 'Chapels', 'religious', '["building=chapel"]'),

('military', 'Военные объекты', 'Military', NULL, '[]'),
('fortress', 'Крепости', 'Fortresses', 'military', '["historic=fort", "historic=castle"]'),
('bunker', 'Бункеры', 'Bunkers', 'military', '["military=bunker"]'),
('memorial', 'Мемориалы', 'Memorials', 'military', '["historic=memorial"]'),
('battlefield', 'Поля сражений', 'Battlefields', 'military', '["historic=battlefield"]'),

('architecture', 'Архитектура', 'Architecture', NULL, '[]'),
('manor', 'Усадьбы', 'Manors', 'architecture', '["historic=manor"]'),
('palace', 'Дворцы', 'Palaces', 'architecture', '["historic=palace"]'),
('tower', 'Башни', 'Towers', 'architecture', '["man_made=tower", "historic=tower"]'),
('ruins', 'Руины', 'Ruins', 'architecture', '["historic=ruins"]'),

('trails', 'Исторические тропы', 'Historical Trails', NULL, '[]'),
('war_path', 'Тропы ВОВ', 'WW2 Trails', 'trails', '[]'),
('trade_route', 'Торговые пути', 'Trade Routes', 'trails', '[]'),
('pilgrimage', 'Паломнические пути', 'Pilgrimage Routes', 'trails', '[]');




