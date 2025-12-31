package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"github.com/dremotha/mapbot/internal/domain"
	"github.com/dremotha/mapbot/internal/infrastructure/qdrant"
	"github.com/dremotha/mapbot/pkg/embedding"
)

type QdrantPOIRepository struct {
	qdrant          *qdrant.Client
	embeddingClient *embedding.Client
}

func NewQdrantPOIRepository(qdrantClient *qdrant.Client, embeddingClient *embedding.Client) *QdrantPOIRepository {
	return &QdrantPOIRepository{
		qdrant:          qdrantClient,
		embeddingClient: embeddingClient,
	}
}

func (r *QdrantPOIRepository) Index(ctx context.Context, poi *domain.POI) error {
	text := poi.Name
	if poi.Description != "" {
		text += " " + poi.Description
	}

	vector, err := r.embeddingClient.Embed(ctx, text)
	if err != nil {
		return err
	}

	return r.qdrant.UpsertPOI(ctx, poi, vector)
}

func (r *QdrantPOIRepository) IndexBatch(ctx context.Context, pois []domain.POI) error {
	// Filter out POIs with empty names
	validPOIs := make([]domain.POI, 0, len(pois))
	texts := make([]string, 0, len(pois))
	
	for _, poi := range pois {
		text := poi.Name
		if text == "" {
			continue // Skip POIs without names
		}
		if poi.Description != "" {
			text += " " + poi.Description
		}
		validPOIs = append(validPOIs, poi)
		texts = append(texts, text)
	}

	if len(validPOIs) == 0 {
		return nil // Nothing to index
	}

	vectors, err := r.embeddingClient.EmbedBatch(ctx, texts)
	if err != nil {
		return err
	}

	if len(vectors) != len(validPOIs) {
		return fmt.Errorf("pois and vectors length mismatch: %d pois vs %d vectors", len(validPOIs), len(vectors))
	}

	return r.qdrant.UpsertBatch(ctx, validPOIs, vectors)
}

func (r *QdrantPOIRepository) SemanticSearch(ctx context.Context, query string, filters domain.SearchFilters) ([]uuid.UUID, []float32, error) {
	vector, err := r.embeddingClient.Embed(ctx, query)
	if err != nil {
		return nil, nil, err
	}

	limit := uint64(filters.Limit)
	if limit == 0 {
		limit = 50
	}

	var results []qdrant.SearchResult
	var searchErr error

	if filters.Center != nil && filters.RadiusKm > 0 {
		results, searchErr = r.qdrant.SearchWithGeo(ctx, vector, limit, filters.Center.Lat, filters.Center.Lng, filters.RadiusKm)
	} else {
		results, searchErr = r.qdrant.Search(ctx, vector, limit, filters.Categories)
	}

	if searchErr != nil {
		return nil, nil, searchErr
	}

	ids := make([]uuid.UUID, len(results))
	scores := make([]float32, len(results))
	for i, r := range results {
		ids[i] = r.ID
		scores[i] = r.Score
	}

	return ids, scores, nil
}




