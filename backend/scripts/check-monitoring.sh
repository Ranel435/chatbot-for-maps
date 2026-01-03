#!/bin/bash

echo "=== Checking MapBot Monitoring Stack ==="
echo ""

echo "1. Checking if services are running..."
docker-compose ps | grep -E "(prometheus|grafana|mapbot-api)"
echo ""

echo "2. Testing /metrics endpoint..."
curl -s http://localhost:8080/metrics | head -10
echo "... (more metrics available)"
echo ""

echo "3. Testing Prometheus..."
curl -s http://localhost:9092/-/healthy
echo ""

echo "4. Testing Grafana..."
curl -s http://localhost:3001/api/health | jq '.' 2>/dev/null || curl -s http://localhost:3001/api/health
echo ""

echo "=== Access URLs ==="
echo "Metrics (raw):     http://localhost:8080/metrics"
echo "Prometheus UI:     http://localhost:9092"
echo "Grafana Dashboard: http://localhost:3001 (admin/admin)"
echo ""
echo "Happy monitoring! 🎉"
