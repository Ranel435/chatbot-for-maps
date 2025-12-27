export const API_URL =  window.location.origin;

export const MAP_CONFIG = {
  center: [55.7558, 37.6173] as [number, number],
  zoom: 11,
  minZoom: 8,
  maxZoom: 18,
};

export const CATEGORIES = {
  religious: { name: 'Религиозные', icon: 'church' },
  military: { name: 'Военные', icon: 'shield' },
  architecture: { name: 'Архитектура', icon: 'building' },
  trails: { name: 'Тропы', icon: 'route' },
} as const;
