package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	grpcapi "github.com/dremotha/mapbot/internal/api/grpc"
	"github.com/dremotha/mapbot/internal/api/rest"
	"github.com/dremotha/mapbot/internal/config"
	"github.com/dremotha/mapbot/internal/infrastructure/osrm"
	"github.com/dremotha/mapbot/internal/infrastructure/postgres"
	infraredis "github.com/dremotha/mapbot/internal/infrastructure/redis"
	"github.com/dremotha/mapbot/internal/repository"
	"github.com/dremotha/mapbot/internal/service"
)

func main() {
	cfg := config.Load()
	ctx := context.Background()

	log.Println("Starting MapBot server...")

	pool, err := postgres.NewPool(ctx, cfg.Postgres)
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}
	defer pool.Close()
	log.Println("Connected to PostgreSQL")

	redisClient, err := infraredis.NewClient(ctx, cfg.Redis)
	if err != nil {
		log.Printf("Warning: Redis not available: %v", err)
	} else {
		log.Println("Connected to Redis")
	}

	osrmClient := osrm.NewClient(cfg.OSRM)

	poiRepo := repository.NewPOIRepository(pool)
	searchService := service.NewSearchService(poiRepo)
	routingService := service.NewRoutingService(osrmClient, poiRepo)
	intentClassifier := service.NewIntentClassifier()
	responseGenerator := service.NewResponseGenerator()

	var cacheManager *service.CacheManager
	if redisClient != nil {
		cacheManager = service.NewCacheManager(redisClient)
	}
	_ = cacheManager

	handler := rest.NewHandler(searchService, intentClassifier, responseGenerator)
	routeHandler := rest.NewRouteHandler(routingService, searchService)
	router := rest.NewRouter(handler, routeHandler)

	server := &http.Server{
		Addr:         ":" + cfg.Server.HTTPPort,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	grpcServer := grpcapi.NewServer(searchService, routingService, intentClassifier)

	go func() {
		log.Printf("gRPC server listening on :%s", cfg.Server.GRPCPort)
		if err := grpcServer.Start(cfg.Server.GRPCPort); err != nil {
			log.Printf("gRPC server error: %v", err)
		}
	}()

	go func() {
		log.Printf("HTTP server listening on :%s", cfg.Server.HTTPPort)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	grpcServer.Stop()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server shutdown error: %v", err)
	}

	log.Println("Server stopped")
}

