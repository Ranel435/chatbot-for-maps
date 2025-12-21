import { Polyline } from 'react-leaflet';
import type { Route } from '../../../shared/types';

interface RoutePolylineProps {
  route: Route;
}

function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lat / 1e5, lng / 1e5]);
  }

  return coordinates;
}

export function RoutePolyline({ route }: RoutePolylineProps) {
  const positions = decodePolyline(route.geometry);

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: '#0ea5e9',
        weight: 4,
        opacity: 0.8,
      }}
    />
  );
}










