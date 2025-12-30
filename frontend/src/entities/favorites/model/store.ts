import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { POI } from '../../../shared/types';

interface FavoritesState {
  favorites: POI[];
  addFavorite: (poi: POI) => void;
  removeFavorite: (poiId: string) => void;
  isFavorite: (poiId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (poi) =>
        set((state) => {
          if (state.favorites.some((f) => f.id === poi.id)) {
            return state;
          }
          return { favorites: [...state.favorites, poi] };
        }),
      
      removeFavorite: (poiId) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== poiId),
        })),
      
      isFavorite: (poiId) => get().favorites.some((f) => f.id === poiId),
      
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'mapbot-favorites',
    }
  )
);

