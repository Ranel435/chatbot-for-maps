package rest

import (
	"github.com/prometheus/client_golang/prometheus"
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

	// Note: PostgreSQL and Redis pool metrics are registered in
	// internal/infrastructure/metrics/collector.go
)

// InitMetrics initializes and registers all Prometheus metrics
func InitMetrics() {
	// Register HTTP metrics only (PostgreSQL and Redis metrics are registered
	// by the metrics collector in internal/infrastructure/metrics/collector.go)
	prometheus.MustRegister(httpRequestsTotal)
	prometheus.MustRegister(httpRequestDuration)
	prometheus.MustRegister(httpRequestsInFlight)

	// Note: Go runtime metrics (go_*, process_*) are automatically registered
	// by Prometheus's DefaultRegistry, so we don't need to register them explicitly
}
