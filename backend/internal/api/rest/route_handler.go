package rest

import (
	"encoding/json"
	"net/http"

	"github.com/dremotha/mapbot/internal/domain"
	"github.com/dremotha/mapbot/internal/service"
)

type RouteHandler struct {
	routingService *service.RoutingService
	searchService  *service.SearchService
}

func NewRouteHandler(routingService *service.RoutingService, searchService *service.SearchService) *RouteHandler {
	return &RouteHandler{
		routingService: routingService,
		searchService:  searchService,
	}
}

type BuildRouteRequest struct {
	Start     *domain.Coordinate   `json:"start,omitempty"`
	End       *domain.Coordinate   `json:"end,omitempty"`
	Waypoints []domain.Coordinate  `json:"waypoints,omitempty"`
	Mode      domain.TransportMode `json:"mode,omitempty"`
}

type BuildRouteFromPOIsRequest struct {
	POIIDs []string             `json:"poi_ids"`
	Start  *domain.Coordinate   `json:"start,omitempty"`
	Mode   domain.TransportMode `json:"mode,omitempty"`
}

type BuildRouteFromQueryRequest struct {
	Query      string               `json:"query"`
	Start      *domain.Coordinate   `json:"start,omitempty"`
	Mode       domain.TransportMode `json:"mode,omitempty"`
	Limit      int                  `json:"limit,omitempty"`
	Categories []string             `json:"categories,omitempty"`
}

func (h *RouteHandler) BuildRoute(w http.ResponseWriter, r *http.Request) {
	var req BuildRouteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	routeReq := domain.RouteRequest{
		Start:     req.Start,
		End:       req.End,
		Waypoints: req.Waypoints,
		Mode:      req.Mode,
	}

	result, err := h.routingService.BuildRoute(r.Context(), routeReq)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to build route")
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (h *RouteHandler) BuildRouteFromPOIs(w http.ResponseWriter, r *http.Request) {
	var req BuildRouteFromPOIsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if len(req.POIIDs) == 0 {
		writeError(w, http.StatusBadRequest, "poi_ids required")
		return
	}

	result, err := h.routingService.BuildRouteFromPOIs(r.Context(), req.POIIDs, req.Start, req.Mode)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to build route")
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func (h *RouteHandler) BuildRouteFromQuery(w http.ResponseWriter, r *http.Request) {
	var req BuildRouteFromQueryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Query == "" {
		writeError(w, http.StatusBadRequest, "query required")
		return
	}

	limit := req.Limit
	if limit == 0 {
		limit = 5
	}

	filters := domain.SearchFilters{
		Categories: req.Categories,
		Limit:      limit,
	}

	if req.Start != nil {
		filters.Center = req.Start
		filters.RadiusKm = 50
	}

	searchResult, err := h.searchService.Search(r.Context(), req.Query, filters)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "search failed")
		return
	}

	if len(searchResult.POIs) == 0 {
		writeError(w, http.StatusNotFound, "no POIs found for query")
		return
	}

	result, err := h.routingService.BuildRouteFromSearch(r.Context(), searchResult.POIs, req.Start, req.Mode)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to build route")
		return
	}

	writeJSON(w, http.StatusOK, result)
}




