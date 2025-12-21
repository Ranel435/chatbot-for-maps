import { Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { POI } from '../../../shared/types';

interface POIMarkerProps {
  poi: POI;
  onClick?: () => void;
}

const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function POIMarker({ poi, onClick }: POIMarkerProps) {
  return (
    <Marker
      position={[poi.lat, poi.lng]}
      icon={defaultIcon}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup>
        <div className="min-w-[200px]">
          <h3 className="font-semibold text-gray-900 mb-1">{poi.name}</h3>
          {poi.short_description && (
            <p className="text-sm text-gray-600 mb-2">{poi.short_description}</p>
          )}
          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{poi.category}</span>
        </div>
      </Popup>
    </Marker>
  );
}










