package domain

import (
	"time"

	"github.com/google/uuid"
)

type POI struct {
	ID               uuid.UUID `json:"id"`
	Name             string    `json:"name"`
	Description      string    `json:"description,omitempty"`
	ShortDescription string    `json:"short_description,omitempty"`
	Lat              float64   `json:"lat"`
	Lng              float64   `json:"lng"`
	Address          string    `json:"address,omitempty"`
	Category         string    `json:"category"`
	Subcategory      string    `json:"subcategory,omitempty"`
	Tags             []string  `json:"tags,omitempty"`
	HistoricalPeriod string    `json:"historical_period,omitempty"`
	YearBuilt        *int      `json:"year_built,omitempty"`
	YearDestroyed    *int      `json:"year_destroyed,omitempty"`
	Source           string    `json:"source"`
	OsmID            *int64    `json:"osm_id,omitempty"`
	PopularityScore  float64   `json:"popularity_score"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type Category struct {
	ID       string     `json:"id"`
	NameRu   string     `json:"name_ru"`
	NameEn   string     `json:"name_en,omitempty"`
	ParentID string     `json:"parent_id,omitempty"`
	Icon     string     `json:"icon,omitempty"`
	OsmTags  []string   `json:"osm_tags,omitempty"`
	Children []Category `json:"children,omitempty"`
}

type HistoricalFact struct {
	ID        uuid.UUID `json:"id"`
	POIID     uuid.UUID `json:"poi_id"`
	FactType  string    `json:"fact_type"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	YearFrom  *int      `json:"year_from,omitempty"`
	YearTo    *int      `json:"year_to,omitempty"`
	SourceURL string    `json:"source_url,omitempty"`
}

type Coordinate struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type SearchFilters struct {
	Categories []string
	Center     *Coordinate
	RadiusKm   float64
	Period     string
	Limit      int
	Offset     int
}

type SearchResult struct {
	POIs   []POI  `json:"pois"`
	Total  int    `json:"total"`
	Query  string `json:"query"`
	TookMs int64  `json:"took_ms"`
}
