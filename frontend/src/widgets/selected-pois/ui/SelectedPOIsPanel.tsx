import { useCallback } from 'react';
import { Card, Button } from '../../../shared/ui';
import { usePOIStore } from '../../../entities/poi';
import { useRouteStore, useBuildRouteFromPOIs } from '../../../entities/route';
import { useGeolocation, useToast } from '../../../shared/lib';

interface SelectedPOIsPanelProps {
  className?: string;
}

export function SelectedPOIsPanel({ className }: SelectedPOIsPanelProps) {
  const { selectedPOIsForRoute, removePOIFromRoute, clearRouteSelection } = usePOIStore();
  const { setCurrentRoute, setRoutePOIs } = useRouteStore();
  const { position } = useGeolocation();
  const buildRouteMutation = useBuildRouteFromPOIs();
  const toast = useToast();

  const handleBuildRoute = useCallback(() => {
    const poiIds = selectedPOIsForRoute.map((p) => p.id);
    buildRouteMutation.mutate(
      {
        poi_ids: poiIds,
        start: position || undefined,
        mode: 'walking',
      },
      {
        onSuccess: (data) => {
          setCurrentRoute(data.route);
          setRoutePOIs(data.pois);
          clearRouteSelection();
          toast.success(`Маршрут построен: ${data.route.distance_km.toFixed(1)} км`);
        },
        onError: () => {
          toast.error('Не удалось построить маршрут');
        },
      }
    );
  }, [selectedPOIsForRoute, position, buildRouteMutation, setCurrentRoute, setRoutePOIs, clearRouteSelection, toast]);

  if (selectedPOIsForRoute.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">
          Выбрано мест: {selectedPOIsForRoute.length}
        </h3>
        <button
          onClick={clearRouteSelection}
          className="text-sm text-white/60 hover:text-white"
        >
          Очистить
        </button>
      </div>

      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        {selectedPOIsForRoute.map((poi, index) => (
          <div
            key={poi.id}
            className="flex items-center gap-2 p-2 bg-white/10 rounded-lg"
          >
            <span className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-medium">
              {index + 1}
            </span>
            <span className="flex-1 text-sm text-white truncate">{poi.name}</span>
            <button
              onClick={() => removePOIFromRoute(poi.id)}
              className="text-white/40 hover:text-red-400"
            >
              x
            </button>
          </div>
        ))}
      </div>

      <Button
        onClick={handleBuildRoute}
        disabled={buildRouteMutation.isPending || selectedPOIsForRoute.length < 2}
        className="w-full"
      >
        {buildRouteMutation.isPending
          ? 'Строим маршрут...'
          : `Построить маршрут (${selectedPOIsForRoute.length} точек)`}
      </Button>

      {selectedPOIsForRoute.length < 2 && (
        <p className="text-xs text-white/50 mt-2 text-center">
          Выберите минимум 2 места для построения маршрута
        </p>
      )}
    </Card>
  );
}






