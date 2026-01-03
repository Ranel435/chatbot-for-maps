package metrics

import (
	"context"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/redis/go-redis/v9"
)

// Collector periodically collects metrics from dependencies
type Collector struct {
	pgPool      *pgxpool.Pool
	redisClient *redis.Client
	interval    time.Duration
	stopCh      chan struct{}

	// PostgreSQL metrics
	pgConnectionsTotal *prometheus.GaugeVec
	pgConnectionsIdle  *prometheus.GaugeVec
	pgConnectionsInUse *prometheus.GaugeVec
	pgMaxConnections   *prometheus.GaugeVec

	// Redis metrics
	redisHitsTotal         *prometheus.CounterVec
	redisMissesTotal       *prometheus.CounterVec
	redisTimeoutsTotal     *prometheus.CounterVec
	redisConnectionsTotal  *prometheus.GaugeVec
	redisConnectionsIdle   *prometheus.GaugeVec
	redisStaleConnections  *prometheus.CounterVec
}

// NewCollector creates a new metrics collector
func NewCollector(pgPool *pgxpool.Pool, redisClient *redis.Client, interval time.Duration) *Collector {
	c := &Collector{
		pgPool:      pgPool,
		redisClient: redisClient,
		interval:    interval,
		stopCh:      make(chan struct{}),

		pgConnectionsTotal: prometheus.NewGaugeVec(
			prometheus.GaugeOpts{
				Name: "postgres_pool_connections_total",
				Help: "Total number of connections in the PostgreSQL pool",
			},
			[]string{},
		),
		pgConnectionsIdle: prometheus.NewGaugeVec(
			prometheus.GaugeOpts{
				Name: "postgres_pool_connections_idle",
				Help: "Number of idle connections in the PostgreSQL pool",
			},
			[]string{},
		),
		pgConnectionsInUse: prometheus.NewGaugeVec(
			prometheus.GaugeOpts{
				Name: "postgres_pool_connections_in_use",
				Help: "Number of connections currently in use in the PostgreSQL pool",
			},
			[]string{},
		),
		pgMaxConnections: prometheus.NewGaugeVec(
			prometheus.GaugeOpts{
				Name: "postgres_pool_max_connections",
				Help: "Maximum number of connections in the PostgreSQL pool",
			},
			[]string{},
		),

		redisHitsTotal: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "redis_pool_hits_total",
				Help: "Total number of times a connection was found in the pool",
			},
			[]string{},
		),
		redisMissesTotal: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "redis_pool_misses_total",
				Help: "Total number of times a connection was not found in the pool",
			},
			[]string{},
		),
		redisTimeoutsTotal: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "redis_pool_timeouts_total",
				Help: "Total number of times a wait timeout occurred",
			},
			[]string{},
		),
		redisConnectionsTotal: prometheus.NewGaugeVec(
			prometheus.GaugeOpts{
				Name: "redis_pool_connections_total",
				Help: "Total number of connections in the Redis pool",
			},
			[]string{},
		),
		redisConnectionsIdle: prometheus.NewGaugeVec(
			prometheus.GaugeOpts{
				Name: "redis_pool_connections_idle",
				Help: "Number of idle connections in the Redis pool",
			},
			[]string{},
		),
		redisStaleConnections: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "redis_pool_stale_connections_total",
				Help: "Total number of stale connections removed from the pool",
			},
			[]string{},
		),
	}

	// Register metrics
	prometheus.MustRegister(c.pgConnectionsTotal)
	prometheus.MustRegister(c.pgConnectionsIdle)
	prometheus.MustRegister(c.pgConnectionsInUse)
	prometheus.MustRegister(c.pgMaxConnections)

	if redisClient != nil {
		prometheus.MustRegister(c.redisHitsTotal)
		prometheus.MustRegister(c.redisMissesTotal)
		prometheus.MustRegister(c.redisTimeoutsTotal)
		prometheus.MustRegister(c.redisConnectionsTotal)
		prometheus.MustRegister(c.redisConnectionsIdle)
		prometheus.MustRegister(c.redisStaleConnections)
	}

	return c
}

// Start begins collecting metrics at the specified interval
func (c *Collector) Start(ctx context.Context) {
	ticker := time.NewTicker(c.interval)
	defer ticker.Stop()

	// Collect immediately on start
	c.collectPostgresMetrics()
	if c.redisClient != nil {
		c.collectRedisMetrics()
	}

	for {
		select {
		case <-ticker.C:
			c.collectPostgresMetrics()
			if c.redisClient != nil {
				c.collectRedisMetrics()
			}
		case <-c.stopCh:
			log.Println("Metrics collector stopped")
			return
		case <-ctx.Done():
			log.Println("Metrics collector stopped due to context cancellation")
			return
		}
	}
}

// Stop stops the metrics collector
func (c *Collector) Stop() {
	close(c.stopCh)
}

// collectPostgresMetrics collects PostgreSQL pool statistics
func (c *Collector) collectPostgresMetrics() {
	if c.pgPool == nil {
		return
	}

	stat := c.pgPool.Stat()
	
	c.pgConnectionsTotal.WithLabelValues().Set(float64(stat.TotalConns()))
	c.pgConnectionsIdle.WithLabelValues().Set(float64(stat.IdleConns()))
	c.pgConnectionsInUse.WithLabelValues().Set(float64(stat.AcquiredConns()))
	c.pgMaxConnections.WithLabelValues().Set(float64(stat.MaxConns()))
}

// collectRedisMetrics collects Redis pool statistics
func (c *Collector) collectRedisMetrics() {
	if c.redisClient == nil {
		return
	}

	stats := c.redisClient.PoolStats()

	c.redisHitsTotal.WithLabelValues().Add(float64(stats.Hits))
	c.redisMissesTotal.WithLabelValues().Add(float64(stats.Misses))
	c.redisTimeoutsTotal.WithLabelValues().Add(float64(stats.Timeouts))
	c.redisConnectionsTotal.WithLabelValues().Set(float64(stats.TotalConns))
	c.redisConnectionsIdle.WithLabelValues().Set(float64(stats.IdleConns))
	c.redisStaleConnections.WithLabelValues().Add(float64(stats.StaleConns))
}
