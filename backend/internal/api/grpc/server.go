package grpc

import (
	"context"
	"fmt"
	"net"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	"github.com/dremotha/mapbot/internal/service"
)

type Server struct {
	grpcServer       *grpc.Server
	searchService    *service.SearchService
	routingService   *service.RoutingService
	intentClassifier *service.IntentClassifier
}

func NewServer(
	searchService *service.SearchService,
	routingService *service.RoutingService,
	intentClassifier *service.IntentClassifier,
) *Server {
	grpcServer := grpc.NewServer(
		grpc.MaxRecvMsgSize(10*1024*1024),
		grpc.MaxSendMsgSize(10*1024*1024),
	)

	s := &Server{
		grpcServer:       grpcServer,
		searchService:    searchService,
		routingService:   routingService,
		intentClassifier: intentClassifier,
	}

	RegisterSearchServiceServer(grpcServer, s)
	RegisterRouteServiceServer(grpcServer, s)
	RegisterHealthServiceServer(grpcServer, s)

	reflection.Register(grpcServer)

	return s
}

func (s *Server) Start(port string) error {
	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		return fmt.Errorf("listen: %w", err)
	}

	return s.grpcServer.Serve(lis)
}

func (s *Server) Stop() {
	s.grpcServer.GracefulStop()
}

type SearchServiceServer interface {
	Search(context.Context, *SearchRequest) (*SearchResponse, error)
	GetPOI(context.Context, *GetPOIRequest) (*POI, error)
	GetCategories(context.Context, *GetCategoriesRequest) (*GetCategoriesResponse, error)
}

type RouteServiceServer interface {
	BuildRoute(context.Context, *BuildRouteRequest) (*BuildRouteResponse, error)
}

type HealthServiceServer interface {
	Check(context.Context, *HealthCheckRequest) (*HealthCheckResponse, error)
}

func RegisterSearchServiceServer(s *grpc.Server, srv SearchServiceServer) {
	s.RegisterService(&_SearchService_serviceDesc, srv)
}

func RegisterRouteServiceServer(s *grpc.Server, srv RouteServiceServer) {
	s.RegisterService(&_RouteService_serviceDesc, srv)
}

func RegisterHealthServiceServer(s *grpc.Server, srv HealthServiceServer) {
	s.RegisterService(&_HealthService_serviceDesc, srv)
}

var _SearchService_serviceDesc = grpc.ServiceDesc{
	ServiceName: "search.SearchService",
	HandlerType: (*SearchServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{MethodName: "Search", Handler: _SearchService_Search_Handler},
		{MethodName: "GetPOI", Handler: _SearchService_GetPOI_Handler},
		{MethodName: "GetCategories", Handler: _SearchService_GetCategories_Handler},
	},
	Streams: []grpc.StreamDesc{},
}

var _RouteService_serviceDesc = grpc.ServiceDesc{
	ServiceName: "route.RouteService",
	HandlerType: (*RouteServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{MethodName: "BuildRoute", Handler: _RouteService_BuildRoute_Handler},
	},
	Streams: []grpc.StreamDesc{},
}

var _HealthService_serviceDesc = grpc.ServiceDesc{
	ServiceName: "health.HealthService",
	HandlerType: (*HealthServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{MethodName: "Check", Handler: _HealthService_Check_Handler},
	},
	Streams: []grpc.StreamDesc{},
}

func _SearchService_Search_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(SearchRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	return srv.(SearchServiceServer).Search(ctx, in)
}

func _SearchService_GetPOI_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetPOIRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	return srv.(SearchServiceServer).GetPOI(ctx, in)
}

func _SearchService_GetCategories_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetCategoriesRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	return srv.(SearchServiceServer).GetCategories(ctx, in)
}

func _RouteService_BuildRoute_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(BuildRouteRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	return srv.(RouteServiceServer).BuildRoute(ctx, in)
}

func _HealthService_Check_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(HealthCheckRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	return srv.(HealthServiceServer).Check(ctx, in)
}




