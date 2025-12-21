import { Card } from '../../../shared/ui';
import type { Route } from '../../../shared/types';

interface RouteInfoProps {
  route: Route;
}

const modeLabels: Record<string, string> = {
  walking: 'Пешком',
  driving: 'На машине',
  cycling: 'На велосипеде',
};

export function RouteInfo({ route }: RouteInfoProps) {
  return (
    <Card padding="sm" className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">
          {route.mode === 'walking' ? 'W' : route.mode === 'cycling' ? 'C' : 'D'}
        </span>
        <span className="text-sm text-white/70">{modeLabels[route.mode]}</span>
      </div>
      <div className="h-8 w-px bg-white/20" />
      <div>
        <span className="font-semibold text-white">{route.distance_km.toFixed(1)} км</span>
        <span className="text-white/50 mx-1">-</span>
        <span className="text-white/70">{Math.round(route.duration_min)} мин</span>
      </div>
      <div className="h-8 w-px bg-white/20" />
      <div className="text-sm text-white/60">
        {route.waypoints.length} точек
      </div>
    </Card>
  );
}










