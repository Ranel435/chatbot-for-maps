package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/google/uuid"

	grpcapi "github.com/dremotha/mapbot/internal/api/grpc"
	"github.com/dremotha/mapbot/internal/api/rest"
	"github.com/dremotha/mapbot/internal/config"
	"github.com/dremotha/mapbot/internal/domain"
	"github.com/dremotha/mapbot/internal/infrastructure/osrm"
	"github.com/dremotha/mapbot/internal/infrastructure/postgres"
	"github.com/dremotha/mapbot/internal/infrastructure/qdrant"
	infraredis "github.com/dremotha/mapbot/internal/infrastructure/redis"
	"github.com/dremotha/mapbot/internal/repository"
	"github.com/dremotha/mapbot/internal/service"
	"github.com/dremotha/mapbot/pkg/embedding"
)

func main() {
	cfg := config.Load()
	ctx := context.Background()

	log.Println("Starting MapBot server...")

	// PostgreSQL
	pool, err := postgres.NewPool(ctx, cfg.Postgres)
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}
	defer pool.Close()
	log.Println("Connected to PostgreSQL")

	// Redis (optional)
	redisClient, err := infraredis.NewClient(ctx, cfg.Redis)
	if err != nil {
		log.Printf("Warning: Redis not available: %v", err)
	} else {
		log.Println("Connected to Redis")
	}

	// Qdrant
	qdrantClient, err := qdrant.NewClient(cfg.Qdrant)
	if err != nil {
		log.Printf("Warning: Qdrant not available: %v. Semantic search will be disabled.", err)
		qdrantClient = nil
	} else {
		log.Println("Connected to Qdrant")
		// Ensure collection exists
		if err := qdrantClient.EnsureCollection(ctx); err != nil {
			log.Printf("Warning: Failed to ensure Qdrant collection: %v", err)
		} else {
			log.Println("Qdrant collection ready")
		}
	}

	// Embedding service
	var embeddingClient *embedding.Client
	if qdrantClient != nil {
		embeddingClient, err = embedding.NewClient(cfg.Embedding.URL)
		if err != nil {
			log.Printf("Warning: Embedding service not available: %v. Semantic search will be disabled.", err)
			embeddingClient = nil
			qdrantClient.Close()
			qdrantClient = nil
		} else {
			log.Println("Connected to Embedding service")
		}
	}

	// OSRM
	osrmClient := osrm.NewClient(cfg.OSRM)

	// Repositories
	poiRepo := repository.NewPOIRepository(pool)

	// Search service - use semantic if available, fallback to basic
	var searchService interface {
		Search(ctx context.Context, query string, filters domain.SearchFilters) (*domain.SearchResult, error)
		GetByID(ctx context.Context, id uuid.UUID) (*domain.POI, error)
		GetCategories(ctx context.Context) ([]domain.Category, error)
	}

	if qdrantClient != nil && embeddingClient != nil {
		qdrantRepo := repository.NewQdrantPOIRepository(qdrantClient, embeddingClient)
		searchService = service.NewSemanticSearchService(poiRepo, qdrantRepo)
		log.Println("Using semantic search")
	} else {
		searchService = service.NewSearchService(poiRepo)
		log.Println("Using basic text search")
	}

	// Services
	routingService := service.NewRoutingService(osrmClient, poiRepo)
	intentClassifier := service.NewIntentClassifier()
	responseGenerator := service.NewResponseGenerator()

	var cacheManager *service.CacheManager
	if redisClient != nil {
		cacheManager = service.NewCacheManager(redisClient)
	}
	_ = cacheManager

	// HTTP handlers
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

	// Cleanup
	if embeddingClient != nil {
		embeddingClient.Close()
	}
	if qdrantClient != nil {
		qdrantClient.Close()
	}

	log.Println("Server stopped")
}
