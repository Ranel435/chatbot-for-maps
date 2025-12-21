import { useState, useCallback } from 'react';
import { Header } from '../../../widgets/header';
import { MapWidget } from '../../../widgets/map';
import { SelectedPOIsPanel } from '../../../widgets/selected-pois';
import { SearchBar } from '../../../features/search-poi';
import { CategoryFilter } from '../../../features/filter-category';
import { POICard, usePOIStore, useSearchPOI } from '../../../entities/poi';
import { Card, Spinner } from '../../../shared/ui';
import type { POI } from '../../../shared/types';

export function ExplorePage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { setSelectedPOI } = usePOIStore();

  const { data, isLoading, error } = useSearchPOI({
    query: searchQuery,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
  });

  const results = data?.pois || [];
  const total = data?.total || 0;

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((categories: string[]) => {
    setSelectedCategories(categories);
  }, []);

  const handlePOIClick = useCallback((poi: POI) => {
    setSelectedPOI(poi);
  }, [setSelectedPOI]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 relative">
        <MapWidget
          pois={results}
          onPOIClick={handlePOIClick}
          className="absolute inset-0 z-0"
        />

        <aside className="absolute left-0 top-0 bottom-0 w-96 bg-black/75 backdrop-blur-sm border-r border-white/10 flex flex-col z-10 overflow-hidden">
          <div className="p-4 border-b border-white/10 space-y-4">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            <CategoryFilter selected={selectedCategories} onChange={handleCategoryChange} />
          </div>

          <SelectedPOIsPanel className="m-4" />

          <div className="flex-1 overflow-y-auto p-4">
            {error ? (
              <Card className="text-center py-8 border-red-500/50 bg-red-500/20">
                <p className="text-red-400">
                  Ошибка загрузки данных. Попробуйте позже.
                </p>
              </Card>
            ) : isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-white/60">Найдено: {total}</p>
                {results.map((poi) => (
                  <POICard
                    key={poi.id}
                    poi={poi}
                    onClick={() => handlePOIClick(poi)}
                    showRouteButton
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-8">
                <p className="text-white/60">
                  Введите запрос или выберите категорию для поиска
                </p>
              </Card>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}










