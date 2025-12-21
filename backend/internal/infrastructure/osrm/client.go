package osrm

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/dremotha/mapbot/internal/config"
	"github.com/dremotha/mapbot/internal/domain"
)

type Client struct {
	httpClient *http.Client
	baseURL    string
}

func NewClient(cfg config.OSRMConfig) *Client {
	log.Printf("OSRM client initialized with URL: %s", cfg.URL)
	return &Client{
		httpClient: &http.Client{Timeout: 30 * time.Second},
		baseURL:    cfg.URL,
	}
}

type RouteResponse struct {
	Code   string  `json:"code"`
	Routes []Route `json:"routes"`
}

type Route struct {
	Distance float64 `json:"distance"`
	Duration float64 `json:"duration"`
	Geometry string  `json:"geometry"`
	Legs     []Leg   `json:"legs"`
}

type Leg struct {
	Distance float64 `json:"distance"`
	Duration float64 `json:"duration"`
	Steps    []Step  `json:"steps"`
}

type Step struct {
	Distance float64 `json:"distance"`
	Duration float64 `json:"duration"`
	Name     string  `json:"name"`
}

type TripResponse struct {
	Code      string     `json:"code"`
	Trips     []Route    `json:"trips"`
	Waypoints []Waypoint `json:"waypoints"`
}

type Waypoint struct {
	Name          string    `json:"name"`
	Location      []float64 `json:"location"`
	WaypointIndex int       `json:"waypoint_index"`
	TripsIndex    int       `json:"trips_index"`
}

func (c *Client) Route(ctx context.Context, waypoints []domain.Coordinate, mode domain.TransportMode) (*domain.Route, error) {
	if len(waypoints) < 2 {
		return nil, fmt.Errorf("at least 2 waypoints required")
	}

	profile := modeToProfile(mode)
	coords := formatCoordinates(waypoints)

	url := fmt.Sprintf("%s/route/v1/%s/%s?overview=full&geometries=polyline", c.baseURL, profile, coords)
	log.Printf("OSRM Route request: %s", url)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		log.Printf("OSRM Route error: %v", err)
		return nil, fmt.Errorf("execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}

	var routeResp RouteResponse
	if err := json.Unmarshal(body, &routeResp); err != nil {
		log.Printf("OSRM Route parse error: %v, body: %s", err, string(body))
		return nil, fmt.Errorf("parse response: %w", err)
	}

	if routeResp.Code != "Ok" || len(routeResp.Routes) == 0 {
		log.Printf("OSRM Route failed: code=%s", routeResp.Code)
		return nil, fmt.Errorf("routing failed: %s", routeResp.Code)
	}

	route := routeResp.Routes[0]
	log.Printf("OSRM Route success: %.1f km, %.0f min", route.Distance/1000, route.Duration/60)

	result := &domain.Route{
		DistanceKm:  route.Distance / 1000,
		DurationMin: route.Duration / 60,
		Geometry:    route.Geometry,
		Mode:        mode,
		Waypoints:   make([]domain.Waypoint, len(waypoints)),
	}

	for i, coord := range waypoints {
		result.Waypoints[i] = domain.Waypoint{
			Location: coord,
			Order:    i,
		}
	}

	return result, nil
}

func (c *Client) Trip(ctx context.Context, waypoints []domain.Coordinate, mode domain.TransportMode, roundtrip bool) (*domain.Route, error) {
	if len(waypoints) < 2 {
		return nil, fmt.Errorf("at least 2 waypoints required")
	}

	profile := modeToProfile(mode)
	coords := formatCoordinates(waypoints)

	roundtripStr := "false"
	if roundtrip {
		roundtripStr = "true"
	}

	url := fmt.Sprintf("%s/trip/v1/%s/%s?overview=full&geometries=polyline&roundtrip=%s&source=first&destination=last",
		c.baseURL, profile, coords, roundtripStr)
	log.Printf("OSRM Trip request: %s", url)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		log.Printf("OSRM Trip error: %v", err)
		return nil, fmt.Errorf("execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}

	var tripResp TripResponse
	if err := json.Unmarshal(body, &tripResp); err != nil {
		log.Printf("OSRM Trip parse error: %v, body: %s", err, string(body))
		return nil, fmt.Errorf("parse response: %w", err)
	}

	if tripResp.Code != "Ok" || len(tripResp.Trips) == 0 {
		log.Printf("OSRM Trip failed: code=%s", tripResp.Code)
		return nil, fmt.Errorf("trip planning failed: %s", tripResp.Code)
	}

	trip := tripResp.Trips[0]
	log.Printf("OSRM Trip success: %.1f km, %.0f min", trip.Distance/1000, trip.Duration/60)

	result := &domain.Route{
		DistanceKm:  trip.Distance / 1000,
		DurationMin: trip.Duration / 60,
		Geometry:    trip.Geometry,
		Mode:        mode,
		Waypoints:   make([]domain.Waypoint, len(tripResp.Waypoints)),
	}

	for i, wp := range tripResp.Waypoints {
		result.Waypoints[i] = domain.Waypoint{
			Location: domain.Coordinate{
				Lat: wp.Location[1],
				Lng: wp.Location[0],
			},
			Name:  wp.Name,
			Order: wp.WaypointIndex,
		}
	}

	return result, nil
}

func modeToProfile(mode domain.TransportMode) string {
	switch mode {
	case domain.TransportWalking:
		return "foot"
	case domain.TransportCycling:
		return "bike"
	case domain.TransportDriving:
		return "car"
	default:
		return "car"
	}
}

func formatCoordinates(waypoints []domain.Coordinate) string {
	parts := make([]string, len(waypoints))
	for i, w := range waypoints {
		parts[i] = fmt.Sprintf("%.6f,%.6f", w.Lng, w.Lat)
	}
	return strings.Join(parts, ";")
}
