import { useState, useCallback } from 'react';
import { Header } from '../../../widgets/header';
import { MapWidget } from '../../../widgets/map';
import { SelectedPOIsPanel } from '../../../widgets/selected-pois';
import { POIDetailPanel } from '../../../widgets/poi-detail-panel';
import { SearchBar } from '../../../features/search-poi';
import { CategoryFilter } from '../../../features/filter-category';
import { POICard, usePOIStore, useSearchPOI } from '../../../entities/poi';
import { Card, Spinner } from '../../../shared/ui';
import { cn } from '../../../shared/lib';
import type { POI } from '../../../shared/types';

export function ExplorePage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const { selectedPOI, setSelectedPOI } = usePOIStore();

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
    setPanelOpen(false); // Close search panel when POI selected on mobile
  }, [setSelectedPOI]);

  const handleCloseDetail = useCallback(() => {
    setSelectedPOI(null);
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

        {/* Mobile toggle button */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className={cn(
            'md:hidden absolute top-4 left-4 z-30 w-12 h-12 rounded-full bg-black/80 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shadow-lg',
            panelOpen && 'left-[calc(100%-4rem)]'
          )}
          aria-label={panelOpen ? 'Закрыть панель' : 'Открыть панель'}
        >
          {panelOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}
        </button>

        {/* Backdrop for mobile */}
        {panelOpen && (
          <div
            className="md:hidden absolute inset-0 bg-black/50 z-5"
            onClick={() => setPanelOpen(false)}
          />
        )}

        <aside
          className={cn(
            'absolute left-0 top-0 bottom-0 w-full md:w-96 bg-black/90 md:bg-black/75 backdrop-blur-sm border-r border-white/10 flex flex-col z-10 overflow-hidden transition-transform duration-300',
            'md:translate-x-0',
            panelOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Mobile close button inside panel */}
          <button
            onClick={() => setPanelOpen(false)}
            className="md:hidden absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
            aria-label="Закрыть"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

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

        {selectedPOI && (
          <POIDetailPanel poi={selectedPOI} onClose={handleCloseDetail} />
        )}
      </main>
    </div>
  );
}










