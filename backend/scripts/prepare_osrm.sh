#!/bin/bash

DATA_DIR="./osrm-data"
INPUT_FILE="$DATA_DIR/central-fed-district.osm.pbf"
OUTPUT_NAME="moscow"

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: $INPUT_FILE not found. Run download_osm.sh first."
    exit 1
fi

echo "Extracting OSM data..."
docker run -t -v "$(pwd)/$DATA_DIR:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/central-fed-district.osm.pbf

echo "Partitioning..."
docker run -t -v "$(pwd)/$DATA_DIR:/data" osrm/osrm-backend osrm-partition /data/central-fed-district.osrm

echo "Customizing..."
docker run -t -v "$(pwd)/$DATA_DIR:/data" osrm/osrm-backend osrm-customize /data/central-fed-district.osrm

mv "$DATA_DIR/central-fed-district.osrm"* "$DATA_DIR/"

echo "OSRM data prepared!"
echo "You can now start OSRM with:"
echo "docker run -t -i -p 5000:5000 -v $(pwd)/$DATA_DIR:/data osrm/osrm-backend osrm-routed --algorithm mld /data/central-fed-district.osrm"




