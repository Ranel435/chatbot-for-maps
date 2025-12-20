package service

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/dremotha/mapbot/internal/domain"
	"github.com/dremotha/mapbot/internal/repository"
)

type SearchService struct {
	poiRepo *repository.POIRepository
}

func NewSearchService(poiRepo *repository.POIRepository) *SearchService {
	return &SearchService{poiRepo: poiRepo}
}

func (s *SearchService) Search(ctx context.Context, query string, filters domain.SearchFilters) (*domain.SearchResult, error) {
	start := time.Now()

	extractedCategories := s.extractCategories(query)
	if len(extractedCategories) > 0 && len(filters.Categories) == 0 {
		filters.Categories = extractedCategories
	}

	cleanQuery := s.cleanQuery(query)

	var result *domain.SearchResult
	var err error

	if cleanQuery == "" && len(filters.Categories) > 0 {
		result, err = s.poiRepo.Search(ctx, filters)
	} else {
		result, err = s.poiRepo.SearchByText(ctx, cleanQuery, filters)
	}

	if err != nil {
		return nil, err
	}

	result.Query = query
	result.TookMs = time.Since(start).Milliseconds()

	return result, nil
}

func (s *SearchService) GetByID(ctx context.Context, id uuid.UUID) (*domain.POI, error) {
	return s.poiRepo.GetByID(ctx, id)
}

func (s *SearchService) GetCategories(ctx context.Context) ([]domain.Category, error) {
	return s.poiRepo.GetCategories(ctx)
}

var categoryKeywords = map[string][]string{
	"religious":    {"церков", "храм", "собор", "монастыр", "часовн", "религиозн"},
	"military":     {"мемориал", "памятник", "монумент", "военн", "боев", "вов", "война", "крепост", "форт", "кремль", "бункер", "укрепл"},
	"architecture": {"усадьб", "имени", "дворец", "дворц", "руин", "развалин", "башн", "архитектур", "здани", "постройк"},
}

func (s *SearchService) extractCategories(query string) []string {
	query = strings.ToLower(query)
	var categories []string
	found := make(map[string]bool)

	for cat, keywords := range categoryKeywords {
		for _, kw := range keywords {
			if strings.Contains(query, kw) && !found[cat] {
				categories = append(categories, cat)
				found[cat] = true
				break
			}
		}
	}

	return categories
}

var stopWords = []string{
	"найди", "покажи", "хочу", "посмотреть", "где", "находится",
	"расположен", "есть", "какие", "все", "ближайшие", "рядом",
	"в москве", "в области", "московской", "старые", "древние",
	"исторические", "красивые", "интересные",
}

func (s *SearchService) cleanQuery(query string) string {
	result := strings.ToLower(query)

	for _, word := range stopWords {
		result = strings.ReplaceAll(result, word, "")
	}

	for _, keywords := range categoryKeywords {
		for _, kw := range keywords {
			result = strings.ReplaceAll(result, kw, "")
		}
	}

	result = strings.TrimSpace(result)
	parts := strings.Fields(result)

	return strings.Join(parts, " ")
}




