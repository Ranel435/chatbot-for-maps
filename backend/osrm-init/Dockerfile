FROM osrm/osrm-backend:latest

COPY data/Moscow.osm.pbf /osm-source/moscow-latest.osm.pbf
COPY prepare.sh /prepare.sh

ENTRYPOINT ["/bin/bash", "/prepare.sh"]






