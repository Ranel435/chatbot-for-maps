package service

import (
	"fmt"
	"strings"

	"github.com/dremotha/mapbot/internal/domain"
)

type ResponseGenerator struct {
	templates map[domain.Intent][]string
}

func NewResponseGenerator() *ResponseGenerator {
	return &ResponseGenerator{
		templates: map[domain.Intent][]string{
			domain.IntentSearch: {
				"Найдено %d мест по запросу",
				"По вашему запросу найдено %d объектов",
			},
			domain.IntentRoute: {
				"Маршрут готов: %.1f км, примерно %d минут",
				"Построен маршрут через %d точек",
			},
			domain.IntentInfo: {
				"%s",
				"%s. Построен в %d году.",
			},
			domain.IntentCategoryList: {
				"Доступно %d категорий мест",
			},
		},
	}
}

func (g *ResponseGenerator) GenerateSearchResponse(result *domain.SearchResult) domain.ChatResponse {
	message := fmt.Sprintf("Найдено %d мест", result.Total)
	if result.Query != "" {
		message = fmt.Sprintf("По запросу \"%s\" найдено %d мест", result.Query, result.Total)
	}

	if result.Total == 0 {
		message = "К сожалению, ничего не найдено. Попробуйте изменить запрос."
	}

	return domain.ChatResponse{
		Intent:  domain.IntentSearch,
		Message: message,
		Data:    result,
	}
}

func (g *ResponseGenerator) GenerateRouteResponse(route *domain.Route, pois []domain.POI) domain.ChatResponse {
	message := fmt.Sprintf("Маршрут готов: %.1f км, примерно %.0f минут",
		route.DistanceKm, route.DurationMin)

	if len(route.Waypoints) > 0 {
		names := make([]string, 0, len(route.Waypoints))
		for _, wp := range route.Waypoints {
			names = append(names, wp.Name)
		}
		message += fmt.Sprintf(". Точки: %s", strings.Join(names, " -> "))
	}

	return domain.ChatResponse{
		Intent:  domain.IntentRoute,
		Message: message,
		Data: domain.RouteResponse{
			Route: route,
			POIs:  pois,
		},
	}
}

func (g *ResponseGenerator) GenerateInfoResponse(poi *domain.POI) domain.ChatResponse {
	message := poi.Name
	if poi.Description != "" {
		message = fmt.Sprintf("%s - %s", poi.Name, poi.Description)
	} else if poi.ShortDescription != "" {
		message = fmt.Sprintf("%s - %s", poi.Name, poi.ShortDescription)
	}

	if poi.YearBuilt != nil {
		message += fmt.Sprintf(" Построен в %d году.", *poi.YearBuilt)
	}

	if poi.HistoricalPeriod != "" {
		message += fmt.Sprintf(" Период: %s.", poi.HistoricalPeriod)
	}

	return domain.ChatResponse{
		Intent:  domain.IntentInfo,
		Message: message,
		Data:    poi,
	}
}

func (g *ResponseGenerator) GenerateCategoryListResponse(categories []domain.Category) domain.ChatResponse {
	message := fmt.Sprintf("Доступно %d категорий мест для посещения", len(categories))

	return domain.ChatResponse{
		Intent:  domain.IntentCategoryList,
		Message: message,
		Data:    categories,
	}
}

func (g *ResponseGenerator) GenerateErrorResponse(err error) domain.ChatResponse {
	return domain.ChatResponse{
		Intent:  domain.IntentSearch,
		Message: "Произошла ошибка при обработке запроса. Попробуйте еще раз.",
		Data:    nil,
	}
}




