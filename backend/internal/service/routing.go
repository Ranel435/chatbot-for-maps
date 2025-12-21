package service

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/google/uuid"

	"github.com/dremotha/mapbot/internal/domain"
	"github.com/dremotha/mapbot/internal/infrastructure/osrm"
	"github.com/dremotha/mapbot/internal/repository"
)

type RoutingService struct {
	osrmClient *osrm.Client
	poiRepo    *repository.POIRepository
}

func NewRoutingService(osrmClient *osrm.Client, poiRepo *repository.POIRepository) *RoutingService {
	return &RoutingService{
		osrmClient: osrmClient,
		poiRepo:    poiRepo,
	}
}

func (s *RoutingService) formatRoutingError(err error) error {
	errStr := err.Error()

	if strings.Contains(errStr, "connection refused") {
		return fmt.Errorf("сервис маршрутизации недоступен")
	}

	if strings.Contains(errStr, "NoRoute") || strings.Contains(errStr, "NoSegment") {
		return fmt.Errorf("невозможно построить маршрут между указанными точками")
	}

	if strings.Contains(errStr, "InvalidValue") {
		return fmt.Errorf("некорректные координаты")
	}

	return fmt.Errorf("ошибка построения маршрута: %w", err)
}

func (s *RoutingService) BuildRoute(ctx context.Context, req domain.RouteRequest) (*domain.RouteResponse, error) {
	var waypoints []domain.Coordinate

	if req.Start != nil {
		waypoints = append(waypoints, *req.Start)
	}

	waypoints = append(waypoints, req.Waypoints...)

	if req.End != nil {
		waypoints = append(waypoints, *req.End)
	}

	if len(waypoints) < 2 {
		return nil, fmt.Errorf("необходимо минимум 2 точки для построения маршрута")
	}

	mode := req.Mode
	if mode == "" {
		mode = domain.TransportDriving
	}

	log.Printf("Building route with %d waypoints, mode=%s", len(waypoints), mode)

	route, err := s.osrmClient.Route(ctx, waypoints, mode)
	if err != nil {
		log.Printf("Route build failed: %v", err)
		return nil, s.formatRoutingError(err)
	}

	return &domain.RouteResponse{
		Route:   route,
		Message: fmt.Sprintf("Маршрут готов: %.1f км, примерно %.0f минут", route.DistanceKm, route.DurationMin),
	}, nil
}

func (s *RoutingService) BuildRouteFromPOIs(ctx context.Context, poiIDs []string, start *domain.Coordinate, mode domain.TransportMode) (*domain.RouteResponse, error) {
	if len(poiIDs) == 0 {
		return nil, fmt.Errorf("не указаны точки интереса")
	}

	pois := make([]domain.POI, 0, len(poiIDs))
	waypoints := make([]domain.Coordinate, 0, len(poiIDs)+1)

	if start != nil {
		waypoints = append(waypoints, *start)
	}

	for _, idStr := range poiIDs {
		id, err := uuid.Parse(idStr)
		if err != nil {
			log.Printf("Invalid POI ID: %s", idStr)
			continue
		}

		poi, err := s.poiRepo.GetByID(ctx, id)
		if err != nil {
			log.Printf("POI not found: %s", idStr)
			continue
		}

		pois = append(pois, *poi)
		waypoints = append(waypoints, domain.Coordinate{Lat: poi.Lat, Lng: poi.Lng})
	}

	if len(waypoints) < 2 {
		return nil, fmt.Errorf("необходимо минимум 2 точки для построения маршрута")
	}

	if mode == "" {
		mode = domain.TransportDriving
	}

	log.Printf("Building trip from %d POIs, mode=%s", len(pois), mode)

	route, err := s.osrmClient.Trip(ctx, waypoints, mode, false)
	if err != nil {
		log.Printf("Trip build failed: %v", err)
		return nil, s.formatRoutingError(err)
	}

	for i := range route.Waypoints {
		if i < len(pois) {
			route.Waypoints[i].POI = &pois[i]
			route.Waypoints[i].Name = pois[i].Name
		}
	}

	return &domain.RouteResponse{
		Route:   route,
		Message: fmt.Sprintf("Маршрут через %d точек: %.1f км, примерно %.0f минут", len(pois), route.DistanceKm, route.DurationMin),
		POIs:    pois,
	}, nil
}

func (s *RoutingService) BuildRouteFromSearch(ctx context.Context, pois []domain.POI, start *domain.Coordinate, mode domain.TransportMode) (*domain.RouteResponse, error) {
	if len(pois) == 0 {
		return nil, fmt.Errorf("не найдены точки интереса")
	}

	waypoints := make([]domain.Coordinate, 0, len(pois)+1)

	if start != nil {
		waypoints = append(waypoints, *start)
	}

	for _, poi := range pois {
		waypoints = append(waypoints, domain.Coordinate{Lat: poi.Lat, Lng: poi.Lng})
	}

	if len(waypoints) < 2 {
		return nil, fmt.Errorf("необходимо минимум 2 точки для построения маршрута")
	}

	if mode == "" {
		mode = domain.TransportDriving
	}

	log.Printf("Building trip from search results: %d POIs, mode=%s", len(pois), mode)

	route, err := s.osrmClient.Trip(ctx, waypoints, mode, false)
	if err != nil {
		log.Printf("Trip build failed: %v", err)
		return nil, s.formatRoutingError(err)
	}

	startOffset := 0
	if start != nil {
		startOffset = 1
	}

	for i := range route.Waypoints {
		poiIdx := i - startOffset
		if poiIdx >= 0 && poiIdx < len(pois) {
			route.Waypoints[i].POI = &pois[poiIdx]
			route.Waypoints[i].Name = pois[poiIdx].Name
		}
	}

	return &domain.RouteResponse{
		Route:   route,
		Message: fmt.Sprintf("Маршрут через %d точек: %.1f км, примерно %.0f минут", len(pois), route.DistanceKm, route.DurationMin),
		POIs:    pois,
	}, nil
}
