package qdrant

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	pb "github.com/qdrant/go-client/qdrant"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/dremotha/mapbot/internal/config"
	"github.com/dremotha/mapbot/internal/domain"
)

const (
	CollectionName = "poi"
	VectorSize     = 384
)

type Client struct {
	conn           *grpc.ClientConn
	pointsClient   pb.PointsClient
	collectionsClient pb.CollectionsClient
}

func NewClient(cfg config.QdrantConfig) (*Client, error) {
	addr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)

	conn, err := grpc.Dial(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, fmt.Errorf("connect to qdrant: %w", err)
	}

	return &Client{
		conn:              conn,
		pointsClient:      pb.NewPointsClient(conn),
		collectionsClient: pb.NewCollectionsClient(conn),
	}, nil
}

func (c *Client) Close() error {
	return c.conn.Close()
}

func (c *Client) EnsureCollection(ctx context.Context) error {
	_, err := c.collectionsClient.Get(ctx, &pb.GetCollectionInfoRequest{
		CollectionName: CollectionName,
	})

	if err == nil {
		return nil
	}

	_, err = c.collectionsClient.Create(ctx, &pb.CreateCollection{
		CollectionName: CollectionName,
		VectorsConfig: &pb.VectorsConfig{
			Config: &pb.VectorsConfig_Params{
				Params: &pb.VectorParams{
					Size:     VectorSize,
					Distance: pb.Distance_Cosine,
				},
			},
		},
	})

	if err != nil {
		return fmt.Errorf("create collection: %w", err)
	}

	return nil
}

func (c *Client) UpsertPOI(ctx context.Context, poi *domain.POI, vector []float32) error {
	point := &pb.PointStruct{
		Id: &pb.PointId{
			PointIdOptions: &pb.PointId_Uuid{Uuid: poi.ID.String()},
		},
		Vectors: &pb.Vectors{
			VectorsOptions: &pb.Vectors_Vector{
				Vector: &pb.Vector{Data: vector},
			},
		},
		Payload: map[string]*pb.Value{
			"name":       {Kind: &pb.Value_StringValue{StringValue: poi.Name}},
			"category":   {Kind: &pb.Value_StringValue{StringValue: poi.Category}},
			"lat":        {Kind: &pb.Value_DoubleValue{DoubleValue: poi.Lat}},
			"lng":        {Kind: &pb.Value_DoubleValue{DoubleValue: poi.Lng}},
			"popularity": {Kind: &pb.Value_DoubleValue{DoubleValue: poi.PopularityScore}},
		},
	}

	_, err := c.pointsClient.Upsert(ctx, &pb.UpsertPoints{
		CollectionName: CollectionName,
		Points:         []*pb.PointStruct{point},
	})

	return err
}

func (c *Client) UpsertBatch(ctx context.Context, pois []domain.POI, vectors [][]float32) error {
	if len(pois) != len(vectors) {
		return fmt.Errorf("pois and vectors length mismatch")
	}

	points := make([]*pb.PointStruct, len(pois))
	for i, poi := range pois {
		points[i] = &pb.PointStruct{
			Id: &pb.PointId{
				PointIdOptions: &pb.PointId_Uuid{Uuid: poi.ID.String()},
			},
			Vectors: &pb.Vectors{
				VectorsOptions: &pb.Vectors_Vector{
					Vector: &pb.Vector{Data: vectors[i]},
				},
			},
			Payload: map[string]*pb.Value{
				"name":       {Kind: &pb.Value_StringValue{StringValue: poi.Name}},
				"category":   {Kind: &pb.Value_StringValue{StringValue: poi.Category}},
				"lat":        {Kind: &pb.Value_DoubleValue{DoubleValue: poi.Lat}},
				"lng":        {Kind: &pb.Value_DoubleValue{DoubleValue: poi.Lng}},
				"popularity": {Kind: &pb.Value_DoubleValue{DoubleValue: poi.PopularityScore}},
			},
		}
	}

	_, err := c.pointsClient.Upsert(ctx, &pb.UpsertPoints{
		CollectionName: CollectionName,
		Points:         points,
	})

	return err
}

type SearchResult struct {
	ID         uuid.UUID
	Score      float32
	Name       string
	Category   string
	Lat        float64
	Lng        float64
	Popularity float64
}

func (c *Client) Search(ctx context.Context, vector []float32, limit uint64, categories []string) ([]SearchResult, error) {
	var filter *pb.Filter
	if len(categories) > 0 {
		values := make([]*pb.Value, len(categories))
		for i, cat := range categories {
			values[i] = &pb.Value{Kind: &pb.Value_StringValue{StringValue: cat}}
		}

		filter = &pb.Filter{
			Must: []*pb.Condition{
				{
					ConditionOneOf: &pb.Condition_Field{
						Field: &pb.FieldCondition{
							Key: "category",
							Match: &pb.Match{
								MatchValue: &pb.Match_Keywords{
									Keywords: &pb.RepeatedStrings{Strings: categories},
								},
							},
						},
					},
				},
			},
		}
	}

	resp, err := c.pointsClient.Search(ctx, &pb.SearchPoints{
		CollectionName: CollectionName,
		Vector:         vector,
		Limit:          limit,
		Filter:         filter,
		WithPayload:    &pb.WithPayloadSelector{SelectorOptions: &pb.WithPayloadSelector_Enable{Enable: true}},
	})

	if err != nil {
		return nil, fmt.Errorf("search: %w", err)
	}

	results := make([]SearchResult, len(resp.Result))
	for i, point := range resp.Result {
		id, _ := uuid.Parse(point.Id.GetUuid())

		result := SearchResult{
			ID:    id,
			Score: point.Score,
		}

		if name, ok := point.Payload["name"]; ok {
			result.Name = name.GetStringValue()
		}
		if cat, ok := point.Payload["category"]; ok {
			result.Category = cat.GetStringValue()
		}
		if lat, ok := point.Payload["lat"]; ok {
			result.Lat = lat.GetDoubleValue()
		}
		if lng, ok := point.Payload["lng"]; ok {
			result.Lng = lng.GetDoubleValue()
		}
		if pop, ok := point.Payload["popularity"]; ok {
			result.Popularity = pop.GetDoubleValue()
		}

		results[i] = result
	}

	return results, nil
}

func (c *Client) SearchWithGeo(ctx context.Context, vector []float32, limit uint64, lat, lng, radiusKm float64) ([]SearchResult, error) {
	filter := &pb.Filter{
		Must: []*pb.Condition{
			{
				ConditionOneOf: &pb.Condition_Field{
					Field: &pb.FieldCondition{
						Key: "lat",
						Range: &pb.Range{
							Gte: float64Ptr(lat - radiusKm/111.0),
							Lte: float64Ptr(lat + radiusKm/111.0),
						},
					},
				},
			},
			{
				ConditionOneOf: &pb.Condition_Field{
					Field: &pb.FieldCondition{
						Key: "lng",
						Range: &pb.Range{
							Gte: float64Ptr(lng - radiusKm/111.0),
							Lte: float64Ptr(lng + radiusKm/111.0),
						},
					},
				},
			},
		},
	}

	resp, err := c.pointsClient.Search(ctx, &pb.SearchPoints{
		CollectionName: CollectionName,
		Vector:         vector,
		Limit:          limit,
		Filter:         filter,
		WithPayload:    &pb.WithPayloadSelector{SelectorOptions: &pb.WithPayloadSelector_Enable{Enable: true}},
	})

	if err != nil {
		return nil, fmt.Errorf("search with geo: %w", err)
	}

	results := make([]SearchResult, len(resp.Result))
	for i, point := range resp.Result {
		id, _ := uuid.Parse(point.Id.GetUuid())

		result := SearchResult{
			ID:    id,
			Score: point.Score,
		}

		if name, ok := point.Payload["name"]; ok {
			result.Name = name.GetStringValue()
		}
		if cat, ok := point.Payload["category"]; ok {
			result.Category = cat.GetStringValue()
		}
		if lat, ok := point.Payload["lat"]; ok {
			result.Lat = lat.GetDoubleValue()
		}
		if lng, ok := point.Payload["lng"]; ok {
			result.Lng = lng.GetDoubleValue()
		}
		if pop, ok := point.Payload["popularity"]; ok {
			result.Popularity = pop.GetDoubleValue()
		}

		results[i] = result
	}

	return results, nil
}

func float64Ptr(v float64) *float64 {
	return &v
}




