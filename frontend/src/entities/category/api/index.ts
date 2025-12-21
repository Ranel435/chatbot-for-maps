import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
    staleTime: 24 * 60 * 60 * 1000,
  });
}










