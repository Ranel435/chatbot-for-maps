package rest

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/dremotha/mapbot/internal/domain"
	"github.com/dremotha/mapbot/internal/service"
)

type Handler struct {
	searchService     *service.SearchService
	intentClassifier  *service.IntentClassifier
	responseGenerator *service.ResponseGenerator
}

func NewHandler(
	searchService *service.SearchService,
	intentClassifier *service.IntentClassifier,
	responseGenerator *service.ResponseGenerator,
) *Handler {
	return &Handler{
		searchService:     searchService,
		intentClassifier:  intentClassifier,
		responseGenerator: responseGenerator,
	}
}

type SearchRequest struct {
	Query      string   `json:"query"`
	Categories []string `json:"categories,omitempty"`
	Lat        *float64 `json:"lat,omitempty"`
	Lng        *float64 `json:"lng,omitempty"`
	RadiusKm   float64  `json:"radius_km,omitempty"`
	Limit      int      `json:"limit,omitempty"`
	Offset     int      `json:"offset,omitempty"`
}

func (h *Handler) Search(w http.ResponseWriter, r *http.Request) {
	var req SearchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	filters := domain.SearchFilters{
		Categories: req.Categories,
		RadiusKm:   req.RadiusKm,
		Limit:      req.Limit,
		Offset:     req.Offset,
	}

	if req.Lat != nil && req.Lng != nil {
		filters.Center = &domain.Coordinate{
			Lat: *req.Lat,
			Lng: *req.Lng,
		}
	}

	result, err := h.searchService.Search(r.Context(), req.Query, filters)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "search failed")
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (h *Handler) Chat(w http.ResponseWriter, r *http.Request) {
	var req domain.ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	intentResult := h.intentClassifier.Classify(req.Query)

	var response domain.ChatResponse

	switch intentResult.Intent {
	case domain.IntentSearch, domain.IntentRoute:
		filters := domain.SearchFilters{Limit: 20}
		if req.Location != nil {
			filters.Center = req.Location
			filters.RadiusKm = 50
		}

		result, err := h.searchService.Search(r.Context(), req.Query, filters)
		if err != nil {
			response = h.responseGenerator.GenerateErrorResponse(err)
		} else {
			response = h.responseGenerator.GenerateSearchResponse(result)
		}

	case domain.IntentCategoryList:
		categories, err := h.searchService.GetCategories(r.Context())
		if err != nil {
			response = h.responseGenerator.GenerateErrorResponse(err)
		} else {
			response = h.responseGenerator.GenerateCategoryListResponse(categories)
		}

	case domain.IntentInfo:
		filters := domain.SearchFilters{Limit: 1}
		result, err := h.searchService.Search(r.Context(), req.Query, filters)
		if err != nil || len(result.POIs) == 0 {
			response = h.responseGenerator.GenerateErrorResponse(err)
		} else {
			response = h.responseGenerator.GenerateInfoResponse(&result.POIs[0])
		}

	default:
		filters := domain.SearchFilters{Limit: 20}
		result, err := h.searchService.Search(r.Context(), req.Query, filters)
		if err != nil {
			response = h.responseGenerator.GenerateErrorResponse(err)
		} else {
			response = h.responseGenerator.GenerateSearchResponse(result)
		}
	}

	writeJSON(w, http.StatusOK, response)
}

func (h *Handler) GetPOI(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid POI ID")
		return
	}

	poi, err := h.searchService.GetByID(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "POI not found")
		return
	}

	writeJSON(w, http.StatusOK, poi)
}

func (h *Handler) GetCategories(w http.ResponseWriter, r *http.Request) {
	categories, err := h.searchService.GetCategories(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get categories")
		return
	}

	writeJSON(w, http.StatusOK, categories)
}

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}




