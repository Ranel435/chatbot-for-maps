#!/bin/bash
set -e

DATA_DIR="/data"
SOURCE_FILE="/osm-source/moscow-latest.osm.pbf"

if [ -f "$DATA_DIR/moscow-latest.osrm.fileIndex" ]; then
    echo "OSRM data already prepared, skipping..."
    exit 0
fi

echo "Copying OSM data to volume..."
cp "$SOURCE_FILE" "$DATA_DIR/moscow-latest.osm.pbf"

echo "Extracting OSRM data..."
osrm-extract -p /opt/car.lua "$DATA_DIR/moscow-latest.osm.pbf"

echo "Partitioning OSRM data..."
osrm-partition "$DATA_DIR/moscow-latest.osrm"

echo "Customizing OSRM data..."
osrm-customize "$DATA_DIR/moscow-latest.osrm"

rm -f "$DATA_DIR/moscow-latest.osm.pbf"

echo "OSRM data preparation complete!"






