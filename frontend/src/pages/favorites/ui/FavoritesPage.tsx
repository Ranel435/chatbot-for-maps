import { Link } from 'react-router-dom';
import { Header } from '../../../widgets/header';
import { MapWidget } from '../../../widgets/map';
import { useFavoritesStore } from '../../../entities/favorites';
import { POICard } from '../../../entities/poi';
import { Button, EmptyFavorites } from '../../../shared/ui';

export function FavoritesPage() {
  const { favorites, clearFavorites } = useFavoritesStore();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 relative">
        <MapWidget
          pois={favorites}
          className="absolute inset-0 z-0"
        />

        <aside className="absolute left-0 top-0 bottom-0 w-full md:w-96 bg-black/90 md:bg-black/75 backdrop-blur-sm border-r border-white/10 flex flex-col z-10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white text-lg">Избранное</h2>
                <p className="text-sm text-white/60">
                  {favorites.length > 0
                    ? `${favorites.length} ${favorites.length === 1 ? 'место' : favorites.length < 5 ? 'места' : 'мест'}`
                    : 'Нет сохранённых мест'}
                </p>
              </div>
              {favorites.length > 0 && (
                <button
                  onClick={clearFavorites}
                  className="text-sm text-white/50 hover:text-red-400 transition-colors"
                >
                  Очистить
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {favorites.length === 0 ? (
              <EmptyFavorites
                action={
                  <Link to="/explore">
                    <Button variant="secondary">Найти интересные места</Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {favorites.map((poi) => (
                  <POICard
                    key={poi.id}
                    poi={poi}
                    showRouteButton
                    showFavorite
                  />
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

