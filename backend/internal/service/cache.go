package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type CacheManager struct {
	redis *redis.Client
}

func NewCacheManager(redisClient *redis.Client) *CacheManager {
	return &CacheManager{redis: redisClient}
}

const (
	SearchCacheTTL     = 5 * time.Minute
	POICacheTTL        = 1 * time.Hour
	EmbeddingCacheTTL  = 15 * time.Minute
	RouteCacheTTL      = 10 * time.Minute
	CategoriesCacheTTL = 24 * time.Hour
)

func (c *CacheManager) Get(ctx context.Context, key string, dest interface{}) error {
	data, err := c.redis.Get(ctx, key).Bytes()
	if err != nil {
		return err
	}
	return json.Unmarshal(data, dest)
}

func (c *CacheManager) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return c.redis.Set(ctx, key, data, ttl).Err()
}

func (c *CacheManager) SetAsync(ctx context.Context, key string, value interface{}, ttl time.Duration) {
	go func() {
		data, err := json.Marshal(value)
		if err != nil {
			return
		}
		c.redis.Set(context.Background(), key, data, ttl)
	}()
}

func (c *CacheManager) Delete(ctx context.Context, key string) error {
	return c.redis.Del(ctx, key).Err()
}

func (c *CacheManager) GetOrCompute(ctx context.Context, key string, ttl time.Duration, dest interface{}, compute func() (interface{}, error)) error {
	if err := c.Get(ctx, key, dest); err == nil {
		return nil
	}

	result, err := compute()
	if err != nil {
		return err
	}

	data, err := json.Marshal(result)
	if err != nil {
		return err
	}

	if err := json.Unmarshal(data, dest); err != nil {
		return err
	}

	c.SetAsync(ctx, key, result, ttl)

	return nil
}

func SearchCacheKey(query string, categories []string, lat, lng *float64, radiusKm float64) string {
	data := fmt.Sprintf("search:%s:%v:%v:%v:%f", query, categories, lat, lng, radiusKm)
	return hashKey(data)
}

func POICacheKey(id string) string {
	return fmt.Sprintf("poi:%s", id)
}

func EmbeddingCacheKey(text string) string {
	return fmt.Sprintf("emb:%s", hashKey(text))
}

func RouteCacheKey(waypoints string, mode string) string {
	data := fmt.Sprintf("route:%s:%s", waypoints, mode)
	return hashKey(data)
}

func CategoriesCacheKey() string {
	return "categories"
}

func hashKey(data string) string {
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:16])
}

type CachedSearchService struct {
	searchService *SearchService
	cache         *CacheManager
}

func NewCachedSearchService(searchService *SearchService, cache *CacheManager) *CachedSearchService {
	return &CachedSearchService{
		searchService: searchService,
		cache:         cache,
	}
}

type CachedEmbeddingClient struct {
	cache *CacheManager
}

func NewCachedEmbeddingClient(cache *CacheManager) *CachedEmbeddingClient {
	return &CachedEmbeddingClient{cache: cache}
}

func (c *CachedEmbeddingClient) GetCached(ctx context.Context, text string) ([]float32, bool) {
	key := EmbeddingCacheKey(text)
	var vector []float32
	if err := c.cache.Get(ctx, key, &vector); err == nil {
		return vector, true
	}
	return nil, false
}

func (c *CachedEmbeddingClient) SetCached(ctx context.Context, text string, vector []float32) {
	key := EmbeddingCacheKey(text)
	c.cache.SetAsync(ctx, key, vector, EmbeddingCacheTTL)
}




