import { create } from 'zustand';
import type { Route, POI, TransportMode } from '../../../shared/types';

interface RouteState {
  currentRoute: Route | null;
  routePOIs: POI[];
  transportMode: TransportMode;
  isEdited: boolean;
  setCurrentRoute: (route: Route | null) => void;
  setRoutePOIs: (pois: POI[]) => void;
  setTransportMode: (mode: TransportMode) => void;
  clearRoute: () => void;
  reorderPOIs: (fromIndex: number, toIndex: number) => void;
  removePOI: (id: string) => void;
  addPOI: (poi: POI, position?: number) => void;
  markEdited: () => void;
  resetEdited: () => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  currentRoute: null,
  routePOIs: [],
  transportMode: 'walking',
  isEdited: false,
  setCurrentRoute: (route) => set({ currentRoute: route, isEdited: false }),
  setRoutePOIs: (pois) => set({ routePOIs: pois }),
  setTransportMode: (mode) => set({ transportMode: mode, isEdited: true }),
  clearRoute: () => set({ currentRoute: null, routePOIs: [], isEdited: false }),
  reorderPOIs: (fromIndex, toIndex) =>
    set((state) => {
      const newPOIs = [...state.routePOIs];
      const [removed] = newPOIs.splice(fromIndex, 1);
      newPOIs.splice(toIndex, 0, removed);
      return { routePOIs: newPOIs, isEdited: true };
    }),
  removePOI: (id) =>
    set((state) => ({
      routePOIs: state.routePOIs.filter((poi) => poi.id !== id),
      isEdited: true,
    })),
  addPOI: (poi, position) =>
    set((state) => {
      const newPOIs = [...state.routePOIs];
      if (position !== undefined && position >= 0 && position <= newPOIs.length) {
        newPOIs.splice(position, 0, poi);
      } else {
        newPOIs.push(poi);
      }
      return { routePOIs: newPOIs, isEdited: true };
    }),
  markEdited: () => set({ isEdited: true }),
  resetEdited: () => set({ isEdited: false }),
}));










