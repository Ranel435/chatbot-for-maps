import { useCallback } from 'react';
import { useFavoritesStore } from '../model/store';
import { IconButton } from '../../../shared/ui';
import { HeartIcon } from '../../../shared/ui/icons';
import { useToast, cn } from '../../../shared/lib';
import type { POI } from '../../../shared/types';

interface FavoriteButtonProps {
  poi: POI;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FavoriteButton({ poi, size = 'md', className }: FavoriteButtonProps) {
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const toast = useToast();
  const isActive = isFavorite(poi.id);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (isActive) {
        removeFavorite(poi.id);
        toast.success('Удалено из избранного');
      } else {
        addFavorite(poi);
        toast.success('Добавлено в избранное');
      }
    },
    [poi, isActive, addFavorite, removeFavorite, toast]
  );

  return (
    <IconButton
      variant="ghost"
      size={size}
      onClick={handleClick}
      className={cn(
        'transition-colors',
        isActive ? 'text-red-400 hover:text-red-300' : 'text-white/40 hover:text-red-400',
        className
      )}
      aria-label={isActive ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      <HeartIcon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} filled={isActive} />
    </IconButton>
  );
}

