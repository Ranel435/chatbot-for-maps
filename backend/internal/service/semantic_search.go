package service

import (
	"context"
	"time"

	"github.com/google/uuid"

	"github.com/dremotha/mapbot/internal/domain"
	"github.com/dremotha/mapbot/internal/repository"
)

type SemanticSearchService struct {
	poiRepo    *repository.POIRepository
	qdrantRepo *repository.QdrantPOIRepository
}

func NewSemanticSearchService(poiRepo *repository.POIRepository, qdrantRepo *repository.QdrantPOIRepository) *SemanticSearchService {
	return &SemanticSearchService{
		poiRepo:    poiRepo,
		qdrantRepo: qdrantRepo,
	}
}

func (s *SemanticSearchService) Search(ctx context.Context, query string, filters domain.SearchFilters) (*domain.SearchResult, error) {
	start := time.Now()

	ids, scores, err := s.qdrantRepo.SemanticSearch(ctx, query, filters)
	if err != nil {
		return s.fallbackSearch(ctx, query, filters)
	}

	if len(ids) == 0 {
		return &domain.SearchResult{
			POIs:   []domain.POI{},
			Total:  0,
			Query:  query,
			TookMs: time.Since(start).Milliseconds(),
		}, nil
	}

	pois, err := s.fetchPOIsByIDs(ctx, ids, scores)
	if err != nil {
		return nil, err
	}

	return &domain.SearchResult{
		POIs:   pois,
		Total:  len(pois),
		Query:  query,
		TookMs: time.Since(start).Milliseconds(),
	}, nil
}

func (s *SemanticSearchService) fetchPOIsByIDs(ctx context.Context, ids []uuid.UUID, scores []float32) ([]domain.POI, error) {
	pois := make([]domain.POI, 0, len(ids))

	for i, id := range ids {
		poi, err := s.poiRepo.GetByID(ctx, id)
		if err != nil {
			continue
		}

		poi.PopularityScore = float64(scores[i])
		pois = append(pois, *poi)
	}

	return pois, nil
}

func (s *SemanticSearchService) fallbackSearch(ctx context.Context, query string, filters domain.SearchFilters) (*domain.SearchResult, error) {
	return s.poiRepo.SearchByText(ctx, query, filters)
}

func (s *SemanticSearchService) IndexPOI(ctx context.Context, poi *domain.POI) error {
	return s.qdrantRepo.Index(ctx, poi)
}

func (s *SemanticSearchService) IndexPOIs(ctx context.Context, pois []domain.POI) error {
	batchSize := 50
	for i := 0; i < len(pois); i += batchSize {
		end := i + batchSize
		if end > len(pois) {
			end = len(pois)
		}

		if err := s.qdrantRepo.IndexBatch(ctx, pois[i:end]); err != nil {
			return err
		}
	}
	return nil
}




