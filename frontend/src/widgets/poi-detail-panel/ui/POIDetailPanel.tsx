import { useCallback } from 'react';
import { usePOIStore } from '../../../entities/poi';
import { useRouteStore, useBuildRouteFromPOIs } from '../../../entities/route';
import { CategoryBadge } from '../../../entities/category';
import { Card, Button } from '../../../shared/ui';
import { useGeolocation, useToast, cn } from '../../../shared/lib';
import type { POI } from '../../../shared/types';

interface POIDetailPanelProps {
  poi: POI;
  onClose: () => void;
  className?: string;
}

export function POIDetailPanel({ poi, onClose, className }: POIDetailPanelProps) {
  const { position } = useGeolocation();
  const { setCurrentRoute, setRoutePOIs } = useRouteStore();
  const { addPOIToRoute, isPOISelectedForRoute } = usePOIStore();
  const buildRouteMutation = useBuildRouteFromPOIs();
  const toast = useToast();

  const isInRoute = isPOISelectedForRoute(poi.id);

  const handleBuildRouteTo = useCallback(() => {
    buildRouteMutation.mutate(
      {
        poi_ids: [poi.id],
        start: position || undefined,
        mode: 'walking',
      },
      {
        onSuccess: (data) => {
          setCurrentRoute(data.route);
          setRoutePOIs(data.pois);
          toast.success('Маршрут построен');
          onClose();
        },
        onError: () => {
          toast.error('Не удалось построить маршрут');
        },
      }
    );
  }, [poi, position, buildRouteMutation, setCurrentRoute, setRoutePOIs, toast, onClose]);

  const handleAddToRoute = useCallback(() => {
    addPOIToRoute(poi);
    toast.success('Место добавлено в маршрут');
  }, [poi, addPOIToRoute, toast]);

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="md:hidden absolute inset-0 bg-black/50 z-15"
        onClick={onClose}
      />
      <aside
        className={cn(
          'absolute right-0 top-0 bottom-0 w-full md:w-[400px] bg-black/95 md:bg-black/85 backdrop-blur-md border-l border-white/10 overflow-y-auto z-20',
          className
        )}
      >
      <div className="p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Закрыть"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h1 className="text-2xl font-bold text-white mb-2 pr-10">{poi.name}</h1>

        <div className="flex items-center gap-2 mb-4">
          <CategoryBadge category={poi.category} />
          {poi.subcategory && <CategoryBadge category={poi.subcategory} size="sm" />}
        </div>

        {poi.address && <p className="text-white/70 mb-4">{poi.address}</p>}

        {poi.description && (
          <div className="mb-6">
            <h2 className="font-semibold text-white mb-2">Описание</h2>
            <p className="text-white/70 leading-relaxed">{poi.description}</p>
          </div>
        )}

        {(poi.year_built || poi.historical_period) && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {poi.year_built && (
              <Card padding="sm">
                <p className="text-sm text-white/50">Год постройки</p>
                <p className="font-semibold text-white">{poi.year_built}</p>
              </Card>
            )}
            {poi.historical_period && (
              <Card padding="sm">
                <p className="text-sm text-white/50">Период</p>
                <p className="font-semibold text-white">{poi.historical_period}</p>
              </Card>
            )}
          </div>
        )}

        {poi.tags && poi.tags.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-white mb-2">Теги</h2>
            <div className="flex flex-wrap gap-2">
              {poi.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-white/10 text-white/70 rounded text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Button
            className="w-full"
            onClick={handleBuildRouteTo}
            disabled={buildRouteMutation.isPending}
          >
            {buildRouteMutation.isPending ? 'Строим маршрут...' : 'Построить маршрут сюда'}
          </Button>
          <Button
            variant={isInRoute ? 'primary' : 'secondary'}
            className="w-full"
            onClick={handleAddToRoute}
            disabled={isInRoute}
          >
            {isInRoute ? 'Добавлено в маршрут' : 'Добавить в маршрут'}
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-white/40">
            Источник: {poi.source}
            {poi.osm_id && ` | OSM ID: ${poi.osm_id}`}
          </p>
        </div>
      </div>
    </aside>
    </>
  );
}

