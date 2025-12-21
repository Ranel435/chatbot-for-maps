import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { Header } from '../../../widgets/header';
import { MapWidget } from '../../../widgets/map';
import { usePOI, usePOIStore } from '../../../entities/poi';
import { useRouteStore, useBuildRouteFromPOIs } from '../../../entities/route';
import { CategoryBadge } from '../../../entities/category';
import { Card, Button, Spinner } from '../../../shared/ui';
import { useGeolocation, useToast } from '../../../shared/lib';

export function POIDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: poi, isLoading, error } = usePOI(id || '');
  const { position } = useGeolocation();
  const { setCurrentRoute, setRoutePOIs } = useRouteStore();
  const { addPOIToRoute, isPOISelectedForRoute } = usePOIStore();
  const buildRouteMutation = useBuildRouteFromPOIs();
  const toast = useToast();

  const isInRoute = poi ? isPOISelectedForRoute(poi.id) : false;

  const handleBuildRouteTo = useCallback(() => {
    if (!poi) return;

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
          navigate('/');
        },
        onError: () => {
          toast.error('Не удалось построить маршрут');
        },
      }
    );
  }, [poi, position, buildRouteMutation, setCurrentRoute, setRoutePOIs, toast, navigate]);

  const handleAddToRoute = useCallback(() => {
    if (!poi) return;
    addPOIToRoute(poi);
    toast.success('Место добавлено в маршрут');
  }, [poi, addPOIToRoute, toast]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 flex items-center justify-center bg-black/75">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !poi) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 flex items-center justify-center bg-black/75">
          <Card className="text-center py-8 px-12">
            <p className="text-white/60 mb-4">Место не найдено</p>
            <Link to="/explore">
              <Button>Вернуться к поиску</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 relative">
        <MapWidget
          pois={[poi]}
          className="absolute inset-0 z-0"
        />

        <aside className="absolute left-0 top-0 bottom-0 w-[480px] bg-black/75 backdrop-blur-sm border-r border-white/10 overflow-y-auto z-10">
          <div className="p-6">
            <Link to="/explore" className="text-sm text-white/70 hover:text-white mb-4 block">
              &larr; Назад к поиску
            </Link>

            <h1 className="text-2xl font-bold text-white mb-2">{poi.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <CategoryBadge category={poi.category} />
              {poi.subcategory && <CategoryBadge category={poi.subcategory} size="sm" />}
            </div>

            {poi.address && (
              <p className="text-white/70 mb-4">{poi.address}</p>
            )}

            {poi.description && (
              <div className="mb-6">
                <h2 className="font-semibold text-white mb-2">Описание</h2>
                <p className="text-white/70 leading-relaxed">{poi.description}</p>
              </div>
            )}

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
      </main>
    </div>
  );
}










