package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/dremotha/mapbot/internal/config"
	"github.com/dremotha/mapbot/internal/infrastructure/postgres"
	"github.com/dremotha/mapbot/internal/infrastructure/qdrant"
	"github.com/dremotha/mapbot/internal/osm"
	"github.com/dremotha/mapbot/internal/repository"
	"github.com/dremotha/mapbot/pkg/embedding"
	pkgosm "github.com/dremotha/mapbot/pkg/osm"
)

func main() {
	var (
		queryType = flag.String("type", "all", "Query type: all, churches, memorials, historic")
	)
	flag.Parse()

	cfg := config.Load()
	ctx := context.Background()

	// PostgreSQL
	log.Println("Connecting to PostgreSQL...")
	pool, err := postgres.NewPool(ctx, cfg.Postgres)
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}
	defer pool.Close()

	// Qdrant (optional)
	var qdrantClient *qdrant.Client
	var embeddingClient *embedding.Client
	var qdrantRepo *repository.QdrantPOIRepository

	qdrantClient, err = qdrant.NewClient(cfg.Qdrant)
	if err != nil {
		log.Printf("Warning: Qdrant not available: %v. Skipping vector indexing.", err)
	} else {
		log.Println("Connected to Qdrant")
		defer qdrantClient.Close()

		// Ensure collection exists
		if err := qdrantClient.EnsureCollection(ctx); err != nil {
			log.Printf("Warning: Failed to ensure Qdrant collection: %v", err)
			qdrantClient = nil
		} else {
			log.Println("Qdrant collection ready")

			// Embedding service
			embeddingClient, err = embedding.NewClient(cfg.Embedding.URL)
			if err != nil {
				log.Printf("Warning: Embedding service not available: %v. Skipping vector indexing.", err)
				qdrantClient = nil
			} else {
				log.Println("Connected to Embedding service")
				defer embeddingClient.Close()

				// Create repository for indexing
				qdrantRepo = repository.NewQdrantPOIRepository(qdrantClient, embeddingClient)
			}
		}
	}

	poiRepo := repository.NewPOIRepository(pool)
	client := pkgosm.NewOverpassClient()
	parser := osm.NewParser()

	bbox := pkgosm.MoscowBBox
	log.Printf("Using bbox: %.4f,%.4f,%.4f,%.4f", bbox.South, bbox.West, bbox.North, bbox.East)

	var resp *pkgosm.OverpassResponse

	switch *queryType {
	case "churches":
		log.Println("Querying churches from OSM...")
		resp, err = client.QueryChurches(ctx, bbox)
	case "memorials":
		log.Println("Querying memorials from OSM...")
		resp, err = client.QueryMemorials(ctx, bbox)
	case "historic", "all":
		log.Println("Querying all historic places from OSM...")
		resp, err = client.QueryHistoricPlaces(ctx, bbox)
	default:
		log.Fatalf("Unknown query type: %s", *queryType)
	}

	if err != nil {
		log.Fatalf("Failed to query OSM: %v", err)
	}

	log.Printf("Received %d elements from OSM", len(resp.Elements))

	pois := parser.ParseElements(resp.Elements)
	log.Printf("Parsed %d POIs", len(pois))

	if len(pois) == 0 {
		log.Println("No POIs to import")
		os.Exit(0)
	}

	batchSize := 50
	imported := 0
	indexed := 0

	for i := 0; i < len(pois); i += batchSize {
		end := i + batchSize
		if end > len(pois) {
			end = len(pois)
		}

		batch := pois[i:end]

		// Import to PostgreSQL
		if err := poiRepo.CreateBatch(ctx, batch); err != nil {
			log.Printf("Failed to import batch %d-%d to Postgres: %v", i, end, err)
			continue
		}

		imported += len(batch)
		log.Printf("Imported to Postgres: %d/%d POIs", imported, len(pois))

		// Index in Qdrant if available
		if qdrantRepo != nil {
			if err := qdrantRepo.IndexBatch(ctx, batch); err != nil {
				log.Printf("Warning: Failed to index batch %d-%d in Qdrant: %v", i, end, err)
			} else {
				indexed += len(batch)
				log.Printf("Indexed in Qdrant: %d/%d POIs", indexed, len(pois))
			}
		}

		time.Sleep(100 * time.Millisecond)
	}

	fmt.Printf("\nImport completed. Total POIs imported to Postgres: %d", imported)
	if qdrantRepo != nil {
		fmt.Printf(", indexed in Qdrant: %d", indexed)
	}
	fmt.Println()
}
