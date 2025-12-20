package domain

type Route struct {
	DistanceKm  float64       `json:"distance_km"`
	DurationMin float64       `json:"duration_min"`
	Geometry    string        `json:"geometry"`
	Waypoints   []Waypoint    `json:"waypoints"`
	Mode        TransportMode `json:"mode"`
}

type Waypoint struct {
	POI      *POI       `json:"poi,omitempty"`
	Location Coordinate `json:"location"`
	Name     string     `json:"name"`
	Order    int        `json:"order"`
}

type TransportMode string

const (
	TransportWalking TransportMode = "walking"
	TransportDriving TransportMode = "driving"
	TransportCycling TransportMode = "cycling"
)

type RouteRequest struct {
	Query     string        `json:"query"`
	Start     *Coordinate   `json:"start,omitempty"`
	End       *Coordinate   `json:"end,omitempty"`
	Waypoints []Coordinate  `json:"waypoints,omitempty"`
	Mode      TransportMode `json:"mode"`
	POIIDs    []string      `json:"poi_ids,omitempty"`
}

type RouteResponse struct {
	Route   *Route `json:"route"`
	Message string `json:"message"`
	POIs    []POI  `json:"pois"`
}

