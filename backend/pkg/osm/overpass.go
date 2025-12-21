package osm

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const defaultOverpassURL = "https://overpass-api.de/api/interpreter"

type OverpassClient struct {
	httpClient *http.Client
	baseURL    string
}

func NewOverpassClient() *OverpassClient {
	return &OverpassClient{
		httpClient: &http.Client{Timeout: 5 * time.Minute},
		baseURL:    defaultOverpassURL,
	}
}

type OverpassResponse struct {
	Elements []Element `json:"elements"`
}

type Element struct {
	Type string            `json:"type"`
	ID   int64             `json:"id"`
	Lat  float64           `json:"lat,omitempty"`
	Lon  float64           `json:"lon,omitempty"`
	Tags map[string]string `json:"tags,omitempty"`

	Center *struct {
		Lat float64 `json:"lat"`
		Lon float64 `json:"lon"`
	} `json:"center,omitempty"`
}

func (c *OverpassClient) Query(ctx context.Context, query string) (*OverpassResponse, error) {
	data := url.Values{}
	data.Set("data", query)

	req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL, strings.NewReader(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("overpass error: %s - %s", resp.Status, string(body))
	}

	var result OverpassResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}

	return &result, nil
}

type BBox struct {
	South float64
	West  float64
	North float64
	East  float64
}

var MoscowBBox = BBox{
	South: 55.1,
	West:  36.8,
	North: 56.1,
	East:  38.2,
}

func (c *OverpassClient) QueryHistoricPlaces(ctx context.Context, bbox BBox) (*OverpassResponse, error) {
	query := fmt.Sprintf(`
[out:json][timeout:300];
(
  node["historic"](%.4f,%.4f,%.4f,%.4f);
  way["historic"](%.4f,%.4f,%.4f,%.4f);
  relation["historic"](%.4f,%.4f,%.4f,%.4f);
  
  node["amenity"="place_of_worship"](%.4f,%.4f,%.4f,%.4f);
  way["amenity"="place_of_worship"](%.4f,%.4f,%.4f,%.4f);
  
  node["building"="church"](%.4f,%.4f,%.4f,%.4f);
  way["building"="church"](%.4f,%.4f,%.4f,%.4f);
  
  node["building"="cathedral"](%.4f,%.4f,%.4f,%.4f);
  way["building"="cathedral"](%.4f,%.4f,%.4f,%.4f);
  
  node["building"="chapel"](%.4f,%.4f,%.4f,%.4f);
  way["building"="chapel"](%.4f,%.4f,%.4f,%.4f);
  
  node["tourism"="attraction"]["historic"](%.4f,%.4f,%.4f,%.4f);
  way["tourism"="attraction"]["historic"](%.4f,%.4f,%.4f,%.4f);
);
out center;
`,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
	)

	return c.Query(ctx, query)
}

func (c *OverpassClient) QueryChurches(ctx context.Context, bbox BBox) (*OverpassResponse, error) {
	query := fmt.Sprintf(`
[out:json][timeout:180];
(
  node["amenity"="place_of_worship"]["religion"="christian"](%.4f,%.4f,%.4f,%.4f);
  way["amenity"="place_of_worship"]["religion"="christian"](%.4f,%.4f,%.4f,%.4f);
  node["building"="church"](%.4f,%.4f,%.4f,%.4f);
  way["building"="church"](%.4f,%.4f,%.4f,%.4f);
  node["building"="cathedral"](%.4f,%.4f,%.4f,%.4f);
  way["building"="cathedral"](%.4f,%.4f,%.4f,%.4f);
  node["building"="chapel"](%.4f,%.4f,%.4f,%.4f);
  way["building"="chapel"](%.4f,%.4f,%.4f,%.4f);
);
out center;
`,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
	)

	return c.Query(ctx, query)
}

func (c *OverpassClient) QueryMemorials(ctx context.Context, bbox BBox) (*OverpassResponse, error) {
	query := fmt.Sprintf(`
[out:json][timeout:180];
(
  node["historic"="memorial"](%.4f,%.4f,%.4f,%.4f);
  way["historic"="memorial"](%.4f,%.4f,%.4f,%.4f);
  node["historic"="monument"](%.4f,%.4f,%.4f,%.4f);
  way["historic"="monument"](%.4f,%.4f,%.4f,%.4f);
);
out center;
`,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
		bbox.South, bbox.West, bbox.North, bbox.East,
	)

	return c.Query(ctx, query)
}




