package repository

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/dremotha/mapbot/internal/domain"
)

type POIRepository struct {
	pool *pgxpool.Pool
}

func NewPOIRepository(pool *pgxpool.Pool) *POIRepository {
	return &POIRepository{pool: pool}
}

func (r *POIRepository) Create(ctx context.Context, poi *domain.POI) error {
	tags, _ := json.Marshal(poi.Tags)

	query := `
		INSERT INTO poi (
			id, name, description, short_description,
			location, address, category, subcategory, tags,
			historical_period, year_built, year_destroyed,
			source, osm_id, popularity_score
		) VALUES (
			$1, $2, $3, $4,
			ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography,
			$7, $8, $9, $10,
			$11, $12, $13,
			$14, $15, $16
		)`

	if poi.ID == uuid.Nil {
		poi.ID = uuid.New()
	}

	_, err := r.pool.Exec(ctx, query,
		poi.ID, poi.Name, poi.Description, poi.ShortDescription,
		poi.Lng, poi.Lat,
		poi.Address, poi.Category, poi.Subcategory, tags,
		poi.HistoricalPeriod, poi.YearBuilt, poi.YearDestroyed,
		poi.Source, poi.OsmID, poi.PopularityScore,
	)

	return err
}

func (r *POIRepository) CreateBatch(ctx context.Context, pois []domain.POI) error {
	batch := &pgx.Batch{}

	query := `
		INSERT INTO poi (
			id, name, description, short_description,
			location, address, category, subcategory, tags,
			historical_period, year_built, year_destroyed,
			source, osm_id, popularity_score
		) VALUES (
			$1, $2, $3, $4,
			ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography,
			$7, $8, $9, $10,
			$11, $12, $13,
			$14, $15, $16
		) ON CONFLICT (id) DO NOTHING`

	for i := range pois {
		poi := &pois[i]
		if poi.ID == uuid.Nil {
			poi.ID = uuid.New()
		}
		tags, _ := json.Marshal(poi.Tags)

		batch.Queue(query,
			poi.ID, poi.Name, poi.Description, poi.ShortDescription,
			poi.Lng, poi.Lat,
			poi.Address, poi.Category, poi.Subcategory, tags,
			poi.HistoricalPeriod, poi.YearBuilt, poi.YearDestroyed,
			poi.Source, poi.OsmID, poi.PopularityScore,
		)
	}

	br := r.pool.SendBatch(ctx, batch)
	defer br.Close()

	for range pois {
		if _, err := br.Exec(); err != nil {
			return fmt.Errorf("batch insert: %w", err)
		}
	}

	return nil
}

func (r *POIRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.POI, error) {
	query := `
		SELECT 
			id, name, description, short_description,
			ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng,
			address, category, subcategory, tags,
			historical_period, year_built, year_destroyed,
			source, osm_id, popularity_score,
			created_at, updated_at
		FROM poi
		WHERE id = $1`

	var poi domain.POI
	var tags []byte

	err := r.pool.QueryRow(ctx, query, id).Scan(
		&poi.ID, &poi.Name, &poi.Description, &poi.ShortDescription,
		&poi.Lat, &poi.Lng,
		&poi.Address, &poi.Category, &poi.Subcategory, &tags,
		&poi.HistoricalPeriod, &poi.YearBuilt, &poi.YearDestroyed,
		&poi.Source, &poi.OsmID, &poi.PopularityScore,
		&poi.CreatedAt, &poi.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	json.Unmarshal(tags, &poi.Tags)
	return &poi, nil
}

func (r *POIRepository) Search(ctx context.Context, filters domain.SearchFilters) (*domain.SearchResult, error) {
	var args []interface{}
	argIdx := 1
	var centerLngIdx, centerLatIdx int

	query := `
		SELECT 
			id, name, description, short_description,
			ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng,
			address, category, subcategory, tags,
			historical_period, year_built, year_destroyed,
			source, osm_id, popularity_score,
			created_at, updated_at`

	if filters.Center != nil {
		centerLngIdx = argIdx
		centerLatIdx = argIdx + 1
		query += fmt.Sprintf(`,
			ST_Distance(location, ST_SetSRID(ST_MakePoint($%d, $%d), 4326)::geography) as distance`, centerLngIdx, centerLatIdx)
		args = append(args, filters.Center.Lng, filters.Center.Lat)
		argIdx += 2
	}

	query += ` FROM poi WHERE 1=1`

	if filters.Center != nil && filters.RadiusKm > 0 {
		query += fmt.Sprintf(` AND ST_DWithin(location, ST_SetSRID(ST_MakePoint($%d, $%d), 4326)::geography, $%d)`,
			centerLngIdx, centerLatIdx, argIdx)
		args = append(args, filters.RadiusKm*1000)
		argIdx++
	}

	if len(filters.Categories) > 0 {
		query += fmt.Sprintf(` AND category = ANY($%d)`, argIdx)
		args = append(args, filters.Categories)
		argIdx++
	}

	if filters.Center != nil {
		query += ` ORDER BY distance`
	} else {
		query += ` ORDER BY popularity_score DESC`
	}

	limit := filters.Limit
	if limit == 0 {
		limit = 50
	}
	query += fmt.Sprintf(` LIMIT $%d OFFSET $%d`, argIdx, argIdx+1)
	args = append(args, limit, filters.Offset)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := &domain.SearchResult{
		POIs: make([]domain.POI, 0),
	}

	for rows.Next() {
		var poi domain.POI
		var tags []byte
		var distance *float64

		scanArgs := []interface{}{
			&poi.ID, &poi.Name, &poi.Description, &poi.ShortDescription,
			&poi.Lat, &poi.Lng,
			&poi.Address, &poi.Category, &poi.Subcategory, &tags,
			&poi.HistoricalPeriod, &poi.YearBuilt, &poi.YearDestroyed,
			&poi.Source, &poi.OsmID, &poi.PopularityScore,
			&poi.CreatedAt, &poi.UpdatedAt,
		}

		if filters.Center != nil {
			scanArgs = append(scanArgs, &distance)
		}

		if err := rows.Scan(scanArgs...); err != nil {
			return nil, err
		}

		json.Unmarshal(tags, &poi.Tags)
		result.POIs = append(result.POIs, poi)
	}

	result.Total = len(result.POIs)
	return result, nil
}

func (r *POIRepository) SearchByText(ctx context.Context, text string, filters domain.SearchFilters) (*domain.SearchResult, error) {
	var args []interface{}
	argIdx := 1

	query := `
		SELECT 
			id, name, description, short_description,
			ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng,
			address, category, subcategory, tags,
			historical_period, year_built, year_destroyed,
			source, osm_id, popularity_score,
			created_at, updated_at
		FROM poi
		WHERE (name ILIKE $1 OR description ILIKE $1 OR address ILIKE $1)`

	args = append(args, "%"+text+"%")
	argIdx++

	if len(filters.Categories) > 0 {
		query += fmt.Sprintf(` AND category = ANY($%d)`, argIdx)
		args = append(args, filters.Categories)
		argIdx++
	}

	if filters.Center != nil && filters.RadiusKm > 0 {
		query += fmt.Sprintf(` AND ST_DWithin(location, ST_SetSRID(ST_MakePoint($%d, $%d), 4326)::geography, $%d)`,
			argIdx, argIdx+1, argIdx+2)
		args = append(args, filters.Center.Lng, filters.Center.Lat, filters.RadiusKm*1000)
		argIdx += 3
	}

	query += ` ORDER BY popularity_score DESC`

	limit := filters.Limit
	if limit == 0 {
		limit = 50
	}
	query += fmt.Sprintf(` LIMIT $%d OFFSET $%d`, argIdx, argIdx+1)
	args = append(args, limit, filters.Offset)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := &domain.SearchResult{
		POIs:  make([]domain.POI, 0),
		Query: text,
	}

	for rows.Next() {
		var poi domain.POI
		var tags []byte

		err := rows.Scan(
			&poi.ID, &poi.Name, &poi.Description, &poi.ShortDescription,
			&poi.Lat, &poi.Lng,
			&poi.Address, &poi.Category, &poi.Subcategory, &tags,
			&poi.HistoricalPeriod, &poi.YearBuilt, &poi.YearDestroyed,
			&poi.Source, &poi.OsmID, &poi.PopularityScore,
			&poi.CreatedAt, &poi.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		json.Unmarshal(tags, &poi.Tags)
		result.POIs = append(result.POIs, poi)
	}

	result.Total = len(result.POIs)
	return result, nil
}

func (r *POIRepository) GetCategories(ctx context.Context) ([]domain.Category, error) {
	query := `
		SELECT id, name_ru, COALESCE(name_en, ''), COALESCE(parent_id, ''), COALESCE(icon, ''), COALESCE(osm_tags::text, '[]')
		FROM categories
		ORDER BY parent_id NULLS FIRST, name_ru`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query categories: %w", err)
	}
	defer rows.Close()

	categoryMap := make(map[string]*domain.Category)
	var rootCategories []domain.Category

	for rows.Next() {
		var cat domain.Category
		var parentID string
		var osmTagsStr string

		if err := rows.Scan(&cat.ID, &cat.NameRu, &cat.NameEn, &parentID, &cat.Icon, &osmTagsStr); err != nil {
			return nil, fmt.Errorf("scan category: %w", err)
		}

		json.Unmarshal([]byte(osmTagsStr), &cat.OsmTags)
		cat.ParentID = parentID

		categoryMap[cat.ID] = &cat

		if parentID == "" {
			rootCategories = append(rootCategories, cat)
		}
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	for id, cat := range categoryMap {
		if cat.ParentID != "" {
			if parent, ok := categoryMap[cat.ParentID]; ok {
				parent.Children = append(parent.Children, *categoryMap[id])
			}
		}
	}

	for i := range rootCategories {
		if parent, ok := categoryMap[rootCategories[i].ID]; ok {
			rootCategories[i].Children = parent.Children
		}
	}

	return rootCategories, nil
}
