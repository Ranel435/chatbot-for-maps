import { useMutation } from '@tanstack/react-query';
import { api } from '../../../shared/api';
import type { Coordinate, TransportMode } from '../../../shared/types';

export function useBuildRoute() {
  return useMutation({
    mutationFn: (params: {
      start?: Coordinate;
      end?: Coordinate;
      waypoints?: Coordinate[];
      mode?: TransportMode;
    }) => api.buildRoute(params),
  });
}

export function useBuildRouteFromQuery() {
  return useMutation({
    mutationFn: (params: {
      query: string;
      start?: Coordinate;
      mode?: TransportMode;
      limit?: number;
    }) => api.buildRouteFromQuery(params),
  });
}

export function useBuildRouteFromPOIs() {
  return useMutation({
    mutationFn: (params: {
      poi_ids: string[];
      start?: Coordinate;
      mode?: TransportMode;
    }) => api.buildRouteFromPOIs(params),
  });
}










