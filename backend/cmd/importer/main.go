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
	"github.com/dremotha/mapbot/internal/repository"
	"github.com/dremotha/mapbot/pkg/osm"
)

func main() {
	var (
		queryType = flag.String("type", "all", "Query type: all, churches, memorials, historic")
	)
	flag.Parse()

	cfg := config.Load()
	ctx := context.Background()

	log.Println("Connecting to PostgreSQL...")
	pool, err := postgres.NewPool(ctx, cfg.Postgres)
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}
	defer pool.Close()

	poiRepo := repository.NewPOIRepository(pool)
	client := osm.NewOverpassClient()
	parser := osm.NewParser()

	bbox := osm.MoscowBBox
	log.Printf("Using bbox: %.4f,%.4f,%.4f,%.4f", bbox.South, bbox.West, bbox.North, bbox.East)

	var resp *osm.OverpassResponse

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

	batchSize := 100
	imported := 0

	for i := 0; i < len(pois); i += batchSize {
		end := i + batchSize
		if end > len(pois) {
			end = len(pois)
		}

		batch := pois[i:end]
		if err := poiRepo.CreateBatch(ctx, batch); err != nil {
			log.Printf("Failed to import batch %d-%d: %v", i, end, err)
			continue
		}

		imported += len(batch)
		log.Printf("Imported %d/%d POIs", imported, len(pois))
		time.Sleep(100 * time.Millisecond)
	}

	fmt.Printf("\nImport completed. Total POIs imported: %d\n", imported)
}
