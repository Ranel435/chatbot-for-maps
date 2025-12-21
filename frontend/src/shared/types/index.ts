export interface Coordinate {
  lat: number;
  lng: number;
}

export interface POI {
  id: string;
  name: string;
  description?: string;
  short_description?: string;
  lat: number;
  lng: number;
  address?: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  historical_period?: string;
  year_built?: number;
  year_destroyed?: number;
  source: string;
  osm_id?: number;
  popularity_score: number;
}

export interface Category {
  id: string;
  name_ru: string;
  name_en?: string;
  parent_id?: string;
  icon?: string;
  osm_tags?: string[];
  children?: Category[];
}

export interface Route {
  distance_km: number;
  duration_min: number;
  geometry: string;
  waypoints: Waypoint[];
  mode: TransportMode;
}

export interface Waypoint {
  poi?: POI;
  location: Coordinate;
  name: string;
  order: number;
}

export type TransportMode = 'walking' | 'driving' | 'cycling';

export interface SearchResult {
  pois: POI[];
  total: number;
  query: string;
  took_ms: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: unknown;
  timestamp: Date;
}

export interface ChatResponse {
  intent: string;
  message: string;
  data?: SearchResult | RouteResponse;
}

export interface RouteResponse {
  route: Route;
  message: string;
  pois: POI[];
}
