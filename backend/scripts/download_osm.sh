#!/bin/bash

DATA_DIR="./osrm-data"
mkdir -p "$DATA_DIR"

MOSCOW_URL="https://download.geofabrik.de/russia/central-fed-district-latest.osm.pbf"

echo "Downloading Moscow region OSM data..."
wget -c "$MOSCOW_URL" -O "$DATA_DIR/central-fed-district.osm.pbf"

echo "Download complete!"
echo "File saved to: $DATA_DIR/central-fed-district.osm.pbf"




