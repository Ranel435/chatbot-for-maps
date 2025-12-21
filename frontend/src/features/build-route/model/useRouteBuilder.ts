import { useCallback } from 'react';
import { useBuildRouteFromQuery } from '../../../entities/route';
import { useRouteStore } from '../../../entities/route';
import { useToast } from '../../../shared/lib';
import type { TransportMode, Coordinate } from '../../../shared/types';

function formatRouteError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    
    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Не удалось подключиться к серверу';
    }
    if (msg.includes('недоступен') || msg.includes('connection')) {
      return 'Сервис маршрутизации временно недоступен';
    }
    if (msg.includes('невозможно построить')) {
      return 'Невозможно построить маршрут между выбранными точками';
    }
    
    return error.message;
  }
  return 'Произошла ошибка при построении маршрута';
}

export function useRouteBuilder() {
  const { mutate, isPending, error } = useBuildRouteFromQuery();
  const { setCurrentRoute, setRoutePOIs, setTransportMode, clearRoute } = useRouteStore();
  const toast = useToast();

  const buildRoute = useCallback(
    (query: string, mode: TransportMode, start?: Coordinate, limit = 5) => {
      setTransportMode(mode);
      mutate(
        { query, mode, limit, start },
        {
          onSuccess: (data) => {
            setCurrentRoute(data.route);
            setRoutePOIs(data.pois);
            toast.success(`Маршрут построен: ${data.route.distance_km.toFixed(1)} км`);
          },
          onError: (err) => {
            toast.error(formatRouteError(err));
          },
        }
      );
    },
    [mutate, setCurrentRoute, setRoutePOIs, setTransportMode, toast]
  );

  return {
    buildRoute,
    clearRoute,
    isLoading: isPending,
    error,
  };
}










