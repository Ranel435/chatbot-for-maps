import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/api';

export function usePOI(id: string) {
  return useQuery({
    queryKey: ['poi', id],
    queryFn: () => api.getPOI(id),
    enabled: !!id,
  });
}

export function useSearchPOI(params: {
  query: string;
  categories?: string[];
  lat?: number;
  lng?: number;
  radius_km?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => api.search({ ...params, limit: params.limit || 20 }),
    enabled: true,
  });
}

