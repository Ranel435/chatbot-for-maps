import { useState, useCallback } from 'react';
import { Header } from '../../../widgets/header';
import { MapWidget } from '../../../widgets/map';
import { RouteInfo, useRouteStore } from '../../../entities/route';
import { Card, Button } from '../../../shared/ui';
import { cn } from '../../../shared/lib';
import { api } from '../../../shared/api';
import type { TransportMode } from '../../../shared/types';

const transportModes: { value: TransportMode; label: string; icon: string }[] = [
  { value: 'walking', label: 'Пешком', icon: 'W' },
  { value: 'cycling', label: 'Велосипед', icon: 'C' },
  { value: 'driving', label: 'Авто', icon: 'D' },
];

export function RoutePage() {
  const {
    currentRoute,
    routePOIs,
    transportMode,
    isEdited,
    setTransportMode,
    reorderPOIs,
    removePOI,
    clearRoute,
    setCurrentRoute,
    resetEdited,
  } = useRouteStore();

  const [isRecalculating, setIsRecalculating] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleRecalculate = useCallback(async () => {
    if (routePOIs.length < 2) return;

    setIsRecalculating(true);
    try {
      const response = await api.buildRouteFromPOIs({
        poi_ids: routePOIs.map((p) => p.id),
        mode: transportMode,
      });
      setCurrentRoute(response.route);
      resetEdited();
    } catch (error) {
      console.error('Failed to recalculate route:', error);
    } finally {
      setIsRecalculating(false);
    }
  }, [routePOIs, transportMode, setCurrentRoute, resetEdited]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    reorderPOIs(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 relative">
        <MapWidget
          pois={routePOIs}
          className="absolute inset-0 z-0"
        />

        <aside className="absolute left-0 top-0 bottom-0 w-96 bg-black/75 backdrop-blur-sm border-r border-white/10 flex flex-col z-10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white text-lg">Редактор маршрута</h2>
            <p className="text-sm text-white/60">Перетаскивайте точки для изменения порядка</p>
          </div>

          {!currentRoute && routePOIs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <Card className="text-center py-8">
                <p className="text-white/70 mb-2">Маршрут не построен</p>
                <p className="text-sm text-white/50">
                  Постройте маршрут через чат или поиск
                </p>
              </Card>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {currentRoute && (
                <div className="p-4 border-b border-white/10">
                  <RouteInfo route={currentRoute} />
                </div>
              )}

              <div className="p-4 border-b border-white/10">
                <p className="text-xs text-white/50 mb-2">Способ передвижения</p>
                <div className="flex gap-2">
                  {transportModes.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setTransportMode(mode.value)}
                      className={cn(
                        'flex-1 py-2 px-3 rounded-lg border transition-colors text-sm',
                        transportMode === mode.value
                          ? 'border-white bg-white/20 text-white'
                          : 'border-white/20 text-white/70 hover:border-white/40'
                      )}
                    >
                      <span className="mr-1">{mode.icon}</span>
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-white/70">Точки маршрута ({routePOIs.length})</p>
                  <button
                    onClick={clearRoute}
                    className="text-xs text-white/50 hover:text-white"
                  >
                    Очистить
                  </button>
                </div>

                <div className="space-y-2">
                  {routePOIs.map((poi, index) => (
                    <div
                      key={poi.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        'flex items-center gap-3 p-3 bg-white/10 rounded-lg cursor-move transition-all',
                        draggedIndex === index && 'opacity-50 scale-95'
                      )}
                    >
                      <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{poi.name}</p>
                        <p className="text-white/50 text-xs truncate">{poi.address || poi.category}</p>
                      </div>
                      <button
                        onClick={() => removePOI(poi.id)}
                        className="text-white/40 hover:text-red-400 p-1"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {isEdited && routePOIs.length >= 2 && (
                <div className="p-4 border-t border-white/10">
                  <Button
                    onClick={handleRecalculate}
                    disabled={isRecalculating}
                    className="w-full"
                  >
                    {isRecalculating ? 'Пересчет...' : 'Пересчитать маршрут'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
