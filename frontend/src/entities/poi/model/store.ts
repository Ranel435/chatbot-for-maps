import { create } from 'zustand';
import type { POI } from '../../../shared/types';

interface POIState {
  selectedPOI: POI | null;
  hoveredPOI: POI | null;
  selectedPOIsForRoute: POI[];
  setSelectedPOI: (poi: POI | null) => void;
  setHoveredPOI: (poi: POI | null) => void;
  addPOIToRoute: (poi: POI) => void;
  removePOIFromRoute: (poiId: string) => void;
  clearRouteSelection: () => void;
  isPOISelectedForRoute: (poiId: string) => boolean;
}

export const usePOIStore = create<POIState>((set, get) => ({
  selectedPOI: null,
  hoveredPOI: null,
  selectedPOIsForRoute: [],
  setSelectedPOI: (poi) => set({ selectedPOI: poi }),
  setHoveredPOI: (poi) => set({ hoveredPOI: poi }),
  addPOIToRoute: (poi) =>
    set((state) => {
      if (state.selectedPOIsForRoute.some((p) => p.id === poi.id)) {
        return state;
      }
      return { selectedPOIsForRoute: [...state.selectedPOIsForRoute, poi] };
    }),
  removePOIFromRoute: (poiId) =>
    set((state) => ({
      selectedPOIsForRoute: state.selectedPOIsForRoute.filter((p) => p.id !== poiId),
    })),
  clearRouteSelection: () => set({ selectedPOIsForRoute: [] }),
  isPOISelectedForRoute: (poiId) => get().selectedPOIsForRoute.some((p) => p.id === poiId),
}));










