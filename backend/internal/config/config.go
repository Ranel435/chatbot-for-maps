package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Server     ServerConfig
	Postgres   PostgresConfig
	Redis      RedisConfig
	Qdrant     QdrantConfig
	OSRM       OSRMConfig
	Embedding  EmbeddingConfig
	Metrics    MetricsConfig
}

type ServerConfig struct {
	HTTPPort string
	GRPCPort string
}

type PostgresConfig struct {
	URL             string
	MaxConns        int32
	MinConns        int32
	MaxConnLifetime time.Duration
}

type RedisConfig struct {
	Addr     string
	Password string
	DB       int
}

type QdrantConfig struct {
	Host string
	Port int
}

type OSRMConfig struct {
	URL string
}

type EmbeddingConfig struct {
	URL string
}

type MetricsConfig struct {
	Enabled bool
}

func Load() *Config {
	return &Config{
		Server: ServerConfig{
			HTTPPort: getEnv("HTTP_PORT", "8080"),
			GRPCPort: getEnv("GRPC_PORT", "9090"),
		},
		Postgres: PostgresConfig{
			URL:             getEnv("POSTGRES_URL", "postgres://mapbot:pass@localhost:5432/mapbot"),
			MaxConns:        int32(getEnvInt("POSTGRES_MAX_CONNS", 100)),
			MinConns:        int32(getEnvInt("POSTGRES_MIN_CONNS", 20)),
			MaxConnLifetime: time.Hour,
		},
		Redis: RedisConfig{
			Addr:     getEnv("REDIS_URL", "localhost:6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvInt("REDIS_DB", 0),
		},
		Qdrant: QdrantConfig{
			Host: getEnv("QDRANT_HOST", "localhost"),
			Port: getEnvInt("QDRANT_PORT", 6334),
		},
		OSRM: OSRMConfig{
			URL: getEnv("OSRM_URL", "http://localhost:5000"),
		},
		Embedding: EmbeddingConfig{
			URL: getEnv("EMBEDDING_URL", "localhost:50051"),
		},
		Metrics: MetricsConfig{
			Enabled: getEnvBool("METRICS_ENABLED", true),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolVal, err := strconv.ParseBool(value); err == nil {
			return boolVal
		}
	}
	return defaultValue
}
