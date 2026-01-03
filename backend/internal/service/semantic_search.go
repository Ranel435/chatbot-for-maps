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
		// Fallback to text search if semantic search fails
		return s.fallbackSearch(ctx, query, filters)
	}

	if len(ids) == 0 {
		// Fallback to text search if no semantic results found
		return s.fallbackSearch(ctx, query, filters)
	}

	pois, err := s.fetchPOIsByIDs(ctx, ids, scores)
	if err != nil {
		return nil, err
	}

	result := &domain.SearchResult{
		POIs:   pois,
		Total:  len(pois),
		Query:  query,
		TookMs: time.Since(start).Milliseconds(),
	}

	// If semantic search returned few results, supplement with text search
	if len(pois) < 10 {
		textResult, err := s.poiRepo.SearchByText(ctx, query, filters)
		if err == nil && textResult.Total > 0 {
			// Merge results, avoiding duplicates
			existingIDs := make(map[uuid.UUID]bool)
			for _, poi := range pois {
				existingIDs[poi.ID] = true
			}
			for _, poi := range textResult.POIs {
				if !existingIDs[poi.ID] && len(result.POIs) < 50 {
					result.POIs = append(result.POIs, poi)
					result.Total++
				}
			}
		}
	}

	return result, nil
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

func (s *SemanticSearchService) GetByID(ctx context.Context, id uuid.UUID) (*domain.POI, error) {
	return s.poiRepo.GetByID(ctx, id)
}

func (s *SemanticSearchService) GetCategories(ctx context.Context) ([]domain.Category, error) {
	return s.poiRepo.GetCategories(ctx)
}




