import { useState, useCallback } from 'react';
import { useSearchPOI } from '../../../entities/poi';

export function useSearch() {
  const [searchParams, setSearchParams] = useState<{
    query: string;
    categories?: string[];
  }>({ query: '' });

  const { data, isLoading, error } = useSearchPOI(searchParams);

  const search = useCallback((query: string, categories?: string[]) => {
    setSearchParams({ query, categories });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchParams({ query: '' });
  }, []);

  return {
    results: data?.pois || [],
    total: data?.total || 0,
    isLoading,
    error,
    search,
    clearSearch,
  };
}










