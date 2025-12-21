import { memo, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { POIMarker } from '../../../entities/poi';
import { RoutePolyline, useRouteStore } from '../../../entities/route';
import { MAP_CONFIG } from '../../../shared/config';
import { useGeolocation } from '../../../shared/lib';
import type { POI, Route } from '../../../shared/types';

interface MapWidgetProps {
  pois?: POI[];
  onPOIClick?: (poi: POI) => void;
  className?: string;
  showUserLocation?: boolean;
}

function FitRouteBounds({ route }: { route: Route | null }) {
  const map = useMap();

  useEffect(() => {
    if (!route?.waypoints?.length) return;

    const bounds = new LatLngBounds(
      route.waypoints.map((wp) => [wp.location.lat, wp.location.lng] as [number, number])
    );

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [route, map]);

  return null;
}

function MapWidgetInner({ pois = [], onPOIClick, className, showUserLocation = true }: MapWidgetProps) {
  const { currentRoute } = useRouteStore();
  const { position } = useGeolocation();

  const handlePOIClick = useCallback(
    (poi: POI) => {
      onPOIClick?.(poi);
    },
    [onPOIClick]
  );

  return (
    <MapContainer
      center={MAP_CONFIG.center}
      zoom={MAP_CONFIG.zoom}
      minZoom={MAP_CONFIG.minZoom}
      maxZoom={MAP_CONFIG.maxZoom}
      className={className}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitRouteBounds route={currentRoute} />

      {showUserLocation && position && (
        <CircleMarker
          center={[position.lat, position.lng]}
          radius={10}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.8,
          }}
        >
          <Popup>Вы здесь</Popup>
        </CircleMarker>
      )}

      {pois.map((poi) => (
        <POIMarker key={poi.id} poi={poi} onClick={() => handlePOIClick(poi)} />
      ))}

      {currentRoute && <RoutePolyline route={currentRoute} />}
    </MapContainer>
  );
}

export const MapWidget = memo(MapWidgetInner);










