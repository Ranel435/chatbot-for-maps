package grpc

import (
	"context"

	"github.com/google/uuid"

	"github.com/dremotha/mapbot/internal/domain"
)

type SearchRequest struct {
	Query      string
	Categories []string
	Center     *Coordinate
	RadiusKm   float64
	Limit      int32
	Offset     int32
}

type SearchResponse struct {
	Pois   []*POI
	Total  int32
	Query  string
	TookMs int64
}

type GetPOIRequest struct {
	Id string
}

type GetCategoriesRequest struct{}

type GetCategoriesResponse struct {
	Categories []*Category
}

type POI struct {
	Id               string
	Name             string
	Description      string
	ShortDescription string
	Lat              float64
	Lng              float64
	Address          string
	Category         string
	Subcategory      string
	Tags             []string
	HistoricalPeriod string
	YearBuilt        *int32
	YearDestroyed    *int32
	Source           string
	OsmId            *int64
	PopularityScore  float64
}

type Coordinate struct {
	Lat float64
	Lng float64
}

type Category struct {
	Id       string
	NameRu   string
	NameEn   string
	ParentId string
	Icon     string
	OsmTags  []string
	Children []*Category
}

type BuildRouteRequest struct {
	Start     *Coordinate
	End       *Coordinate
	Waypoints []*Coordinate
	Mode      string
}

type BuildRouteResponse struct {
	Route   *Route
	Message string
	Pois    []*POI
}

type Route struct {
	DistanceKm  float64
	DurationMin float64
	Geometry    string
	Waypoints   []*Waypoint
	Mode        string
}

type Waypoint struct {
	Poi      *POI
	Location *Coordinate
	Name     string
	Order    int32
}

type HealthCheckRequest struct{}

type HealthCheckResponse struct {
	Status string
}

func (s *Server) Search(ctx context.Context, req *SearchRequest) (*SearchResponse, error) {
	filters := domain.SearchFilters{
		Categories: req.Categories,
		RadiusKm:   req.RadiusKm,
		Limit:      int(req.Limit),
		Offset:     int(req.Offset),
	}

	if req.Center != nil {
		filters.Center = &domain.Coordinate{
			Lat: req.Center.Lat,
			Lng: req.Center.Lng,
		}
	}

	result, err := s.searchService.Search(ctx, req.Query, filters)
	if err != nil {
		return nil, err
	}

	pois := make([]*POI, len(result.POIs))
	for i, p := range result.POIs {
		pois[i] = domainPOIToGRPC(&p)
	}

	return &SearchResponse{
		Pois:   pois,
		Total:  int32(result.Total),
		Query:  result.Query,
		TookMs: result.TookMs,
	}, nil
}

func (s *Server) GetPOI(ctx context.Context, req *GetPOIRequest) (*POI, error) {
	id, err := uuid.Parse(req.Id)
	if err != nil {
		return nil, err
	}

	poi, err := s.searchService.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return domainPOIToGRPC(poi), nil
}

func (s *Server) GetCategories(ctx context.Context, req *GetCategoriesRequest) (*GetCategoriesResponse, error) {
	categories, err := s.searchService.GetCategories(ctx)
	if err != nil {
		return nil, err
	}

	grpcCategories := make([]*Category, len(categories))
	for i, c := range categories {
		grpcCategories[i] = domainCategoryToGRPC(&c)
	}

	return &GetCategoriesResponse{Categories: grpcCategories}, nil
}

func (s *Server) BuildRoute(ctx context.Context, req *BuildRouteRequest) (*BuildRouteResponse, error) {
	waypoints := make([]domain.Coordinate, len(req.Waypoints))
	for i, w := range req.Waypoints {
		waypoints[i] = domain.Coordinate{Lat: w.Lat, Lng: w.Lng}
	}

	routeReq := domain.RouteRequest{
		Waypoints: waypoints,
		Mode:      domain.TransportMode(req.Mode),
	}

	if req.Start != nil {
		routeReq.Start = &domain.Coordinate{Lat: req.Start.Lat, Lng: req.Start.Lng}
	}
	if req.End != nil {
		routeReq.End = &domain.Coordinate{Lat: req.End.Lat, Lng: req.End.Lng}
	}

	result, err := s.routingService.BuildRoute(ctx, routeReq)
	if err != nil {
		return nil, err
	}

	return domainRouteResponseToGRPC(result), nil
}

func (s *Server) Check(ctx context.Context, req *HealthCheckRequest) (*HealthCheckResponse, error) {
	return &HealthCheckResponse{Status: "SERVING"}, nil
}

func domainPOIToGRPC(p *domain.POI) *POI {
	poi := &POI{
		Id:               p.ID.String(),
		Name:             p.Name,
		Description:      p.Description,
		ShortDescription: p.ShortDescription,
		Lat:              p.Lat,
		Lng:              p.Lng,
		Address:          p.Address,
		Category:         p.Category,
		Subcategory:      p.Subcategory,
		Tags:             p.Tags,
		HistoricalPeriod: p.HistoricalPeriod,
		Source:           p.Source,
		PopularityScore:  p.PopularityScore,
	}

	if p.YearBuilt != nil {
		yb := int32(*p.YearBuilt)
		poi.YearBuilt = &yb
	}
	if p.YearDestroyed != nil {
		yd := int32(*p.YearDestroyed)
		poi.YearDestroyed = &yd
	}
	if p.OsmID != nil {
		poi.OsmId = p.OsmID
	}

	return poi
}

func domainCategoryToGRPC(c *domain.Category) *Category {
	cat := &Category{
		Id:       c.ID,
		NameRu:   c.NameRu,
		NameEn:   c.NameEn,
		ParentId: c.ParentID,
		Icon:     c.Icon,
		OsmTags:  c.OsmTags,
	}

	if len(c.Children) > 0 {
		cat.Children = make([]*Category, len(c.Children))
		for i, child := range c.Children {
			cat.Children[i] = domainCategoryToGRPC(&child)
		}
	}

	return cat
}

func domainRouteResponseToGRPC(r *domain.RouteResponse) *BuildRouteResponse {
	resp := &BuildRouteResponse{
		Message: r.Message,
	}

	if r.Route != nil {
		resp.Route = &Route{
			DistanceKm:  r.Route.DistanceKm,
			DurationMin: r.Route.DurationMin,
			Geometry:    r.Route.Geometry,
			Mode:        string(r.Route.Mode),
		}

		resp.Route.Waypoints = make([]*Waypoint, len(r.Route.Waypoints))
		for i, wp := range r.Route.Waypoints {
			grpcWp := &Waypoint{
				Location: &Coordinate{Lat: wp.Location.Lat, Lng: wp.Location.Lng},
				Name:     wp.Name,
				Order:    int32(wp.Order),
			}
			if wp.POI != nil {
				grpcWp.Poi = domainPOIToGRPC(wp.POI)
			}
			resp.Route.Waypoints[i] = grpcWp
		}
	}

	if len(r.POIs) > 0 {
		resp.Pois = make([]*POI, len(r.POIs))
		for i, p := range r.POIs {
			resp.Pois[i] = domainPOIToGRPC(&p)
		}
	}

	return resp
}




