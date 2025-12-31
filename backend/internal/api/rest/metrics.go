package rest

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
)

var (
	// HTTP Metrics
	httpRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "endpoint", "status"},
	)

	httpRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request duration in seconds",
			Buckets: []float64{.001, .005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10},
		},
		[]string{"method", "endpoint"},
	)

	httpRequestsInFlight = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "http_requests_in_flight",
			Help: "Current number of HTTP requests being processed",
		},
	)

	// PostgreSQL Pool Metrics
	postgresPoolConnectionsTotal = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "postgres_pool_connections_total",
			Help: "Total number of connections in the PostgreSQL pool",
		},
	)

	postgresPoolConnectionsIdle = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "postgres_pool_connections_idle",
			Help: "Number of idle connections in the PostgreSQL pool",
		},
	)

	postgresPoolConnectionsInUse = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "postgres_pool_connections_in_use",
			Help: "Number of connections currently in use in the PostgreSQL pool",
		},
	)

	postgresPoolMaxConnections = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "postgres_pool_max_connections",
			Help: "Maximum number of connections in the PostgreSQL pool",
		},
	)

	// Redis Pool Metrics
	redisPoolHitsTotal = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "redis_pool_hits_total",
			Help: "Total number of times a connection was found in the pool",
		},
	)

	redisPoolMissesTotal = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "redis_pool_misses_total",
			Help: "Total number of times a connection was not found in the pool",
		},
	)

	redisPoolTimeoutsTotal = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "redis_pool_timeouts_total",
			Help: "Total number of times a wait timeout occurred",
		},
	)

	redisPoolConnectionsTotal = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "redis_pool_connections_total",
			Help: "Total number of connections in the Redis pool",
		},
	)

	redisPoolConnectionsIdle = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "redis_pool_connections_idle",
			Help: "Number of idle connections in the Redis pool",
		},
	)

	redisPoolStaleConnectionsTotal = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "redis_pool_stale_connections_total",
			Help: "Total number of stale connections removed from the pool",
		},
	)
)

// InitMetrics initializes and registers all Prometheus metrics
func InitMetrics() {
	// Register HTTP metrics
	prometheus.MustRegister(httpRequestsTotal)
	prometheus.MustRegister(httpRequestDuration)
	prometheus.MustRegister(httpRequestsInFlight)

	// Register PostgreSQL metrics
	prometheus.MustRegister(postgresPoolConnectionsTotal)
	prometheus.MustRegister(postgresPoolConnectionsIdle)
	prometheus.MustRegister(postgresPoolConnectionsInUse)
	prometheus.MustRegister(postgresPoolMaxConnections)

	// Register Redis metrics
	prometheus.MustRegister(redisPoolHitsTotal)
	prometheus.MustRegister(redisPoolMissesTotal)
	prometheus.MustRegister(redisPoolTimeoutsTotal)
	prometheus.MustRegister(redisPoolConnectionsTotal)
	prometheus.MustRegister(redisPoolConnectionsIdle)
	prometheus.MustRegister(redisPoolStaleConnectionsTotal)

	// Register Go runtime metrics
	prometheus.MustRegister(collectors.NewGoCollector())
	prometheus.MustRegister(collectors.NewProcessCollector(collectors.ProcessCollectorOpts{}))
}
