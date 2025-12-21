import { Link } from 'react-router-dom';
import { Card, Button } from '../../../shared/ui';
import { cn } from '../../../shared/lib/cn';
import { usePOIStore } from '../model/store';
import type { POI } from '../../../shared/types';

interface POICardProps {
  poi: POI;
  compact?: boolean;
  onClick?: () => void;
  showRouteButton?: boolean;
  className?: string;
}

const categoryIcons: Record<string, string> = {
  religious: 'church',
  church: 'church',
  monastery: 'church',
  military: 'shield',
  memorial: 'flag',
  architecture: 'building',
  manor: 'home',
  trails: 'map',
};

export function POICard({ poi, compact = false, onClick, showRouteButton = false, className }: POICardProps) {
  const icon = categoryIcons[poi.subcategory || poi.category] || 'map-pin';
  const { addPOIToRoute, removePOIFromRoute, isPOISelectedForRoute } = usePOIStore();
  const isSelected = isPOISelectedForRoute(poi.id);

  const handleRouteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelected) {
      removePOIFromRoute(poi.id);
    } else {
      addPOIToRoute(poi);
    }
  };

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors',
          isSelected && 'bg-white/20 border border-white/30',
          className
        )}
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
          <span className="text-lg">{icon === 'church' ? '+' : icon === 'shield' ? 'S' : 'P'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{poi.name}</h3>
          <p className="text-sm text-white/60 truncate">{poi.address || poi.category}</p>
        </div>
        {showRouteButton && (
          <button
            onClick={handleRouteToggle}
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors',
              isSelected
                ? 'bg-white text-black'
                : 'bg-white/20 text-white hover:bg-white/30'
            )}
          >
            {isSelected ? '-' : '+'}
          </button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('hover:bg-white/20 transition-colors', isSelected && 'ring-2 ring-white/50', className)}>
      <Link to={`/poi/${poi.id}`} className="block">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center text-white flex-shrink-0">
            <span className="text-2xl">{icon === 'church' ? '+' : icon === 'shield' ? 'S' : 'P'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white mb-1">{poi.name}</h3>
            {poi.short_description && (
              <p className="text-sm text-white/70 line-clamp-2 mb-2">{poi.short_description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="px-2 py-0.5 bg-white/10 rounded">{poi.category}</span>
              {poi.year_built && <span>Построен: {poi.year_built}</span>}
            </div>
          </div>
        </div>
      </Link>
      {showRouteButton && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <Button
            size="sm"
            variant={isSelected ? 'primary' : 'secondary'}
            onClick={handleRouteToggle}
            className="w-full"
          >
            {isSelected ? 'Убрать из маршрута' : 'Добавить в маршрут'}
          </Button>
        </div>
      )}
    </Card>
  );
}










