import { Card, Button } from '../../../shared/ui';
import { RouteInfo, useRouteStore } from '../../../entities/route';
import { POICard } from '../../../entities/poi';

interface RoutePanelProps {
  className?: string;
}

export function RoutePanel({ className }: RoutePanelProps) {
  const { currentRoute, routePOIs, clearRoute } = useRouteStore();

  if (!currentRoute) {
    return null;
  }

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">Маршрут</h2>
        <Button variant="ghost" size="sm" onClick={clearRoute}>
          Очистить
        </Button>
      </div>

      <RouteInfo route={currentRoute} />

      {routePOIs.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-white/70 mb-2">Точки маршрута</h3>
          <div className="space-y-2">
            {routePOIs.map((poi, index) => (
              <div key={poi.id} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {index + 1}
                </div>
                <POICard poi={poi} compact />
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}










