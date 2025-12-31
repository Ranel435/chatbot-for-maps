import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../../../shared/ui';
import { CategoryIcon, ClockIcon, RouteIcon } from '../../../shared/ui/icons';
import { useRouteStore, useBuildRouteFromPOIs } from '../../route';
import { useToast, cn } from '../../../shared/lib';
import type { PresetRoute } from '../model/types';

interface PresetRouteCardProps {
  route: PresetRoute;
  className?: string;
}

const difficultyLabels = {
  easy: 'Легкий',
  medium: 'Средний',
  hard: 'Сложный',
};

const difficultyColors = {
  easy: 'success',
  medium: 'warning',
  hard: 'error',
} as const;

export function PresetRouteCard({ route, className }: PresetRouteCardProps) {
  const navigate = useNavigate();
  const { setCurrentRoute, setRoutePOIs } = useRouteStore();
  const buildRouteMutation = useBuildRouteFromPOIs();
  const toast = useToast();

  const handleStartRoute = useCallback(() => {
    buildRouteMutation.mutate(
      { poi_ids: route.poi_ids, mode: 'walking' },
      {
        onSuccess: (data) => {
          setCurrentRoute(data.route);
          setRoutePOIs(data.pois);
          toast.success('Маршрут загружен');
          navigate('/route');
        },
        onError: () => {
          toast.error('Не удалось загрузить маршрут');
        },
      }
    );
  }, [route, buildRouteMutation, setCurrentRoute, setRoutePOIs, toast, navigate]);

  return (
    <Card className={cn('hover:bg-white/15 transition-colors', className)}>
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <CategoryIcon category={route.category} size={28} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white mb-1">{route.name}</h3>
          <p className="text-sm text-white/60 line-clamp-2 mb-3">{route.description}</p>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/50 mb-3">
            <div className="flex items-center gap-1">
              <ClockIcon size={14} />
              <span>{route.duration_hours} ч</span>
            </div>
            <div className="flex items-center gap-1">
              <RouteIcon size={14} />
              <span>{route.distance_km} км</span>
            </div>
            <Badge variant={difficultyColors[route.difficulty]} size="sm">
              {difficultyLabels[route.difficulty]}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {route.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-white/5 text-white/50 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10">
        <Button
          size="sm"
          onClick={handleStartRoute}
          disabled={buildRouteMutation.isPending}
          className="w-full"
        >
          {buildRouteMutation.isPending ? 'Загрузка...' : `Начать маршрут (${route.poi_ids.length} точек)`}
        </Button>
      </div>
    </Card>
  );
}

