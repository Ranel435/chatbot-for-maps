import { API_URL } from '../config';
import type { SearchResult, POI, Category, ChatResponse, RouteResponse, Coordinate, TransportMode } from '../types';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async search(params: {
    query: string;
    categories?: string[];
    lat?: number;
    lng?: number;
    radius_km?: number;
    limit?: number;
  }): Promise<SearchResult> {
    return this.request<SearchResult>('/api/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async chat(query: string, location?: Coordinate): Promise<ChatResponse> {
    return this.request<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ query, location }),
    });
  }

  async getPOI(id: string): Promise<POI> {
    return this.request<POI>(`/api/poi/${id}`);
  }

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/categories');
  }

  async buildRoute(params: {
    start?: Coordinate;
    end?: Coordinate;
    waypoints?: Coordinate[];
    mode?: TransportMode;
  }): Promise<RouteResponse> {
    return this.request<RouteResponse>('/api/route', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async buildRouteFromQuery(params: {
    query: string;
    start?: Coordinate;
    mode?: TransportMode;
    limit?: number;
  }): Promise<RouteResponse> {
    return this.request<RouteResponse>('/api/route/query', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async buildRouteFromPOIs(params: {
    poi_ids: string[];
    start?: Coordinate;
    mode?: TransportMode;
  }): Promise<RouteResponse> {
    return this.request<RouteResponse>('/api/route/pois', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const api = new ApiClient(API_URL);
