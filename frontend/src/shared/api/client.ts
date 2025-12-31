import { API_URL } from '../config';
import type { SearchResult, POI, Category, ChatResponse, RouteResponse, Coordinate, TransportMode } from '../types';
import { mockSearch, mockGetPOI, mockCategories, getMockChatResponse, mockBuildRoute, mockPOIs } from './mock';

// Установите true для принудительного использования mock данных
const USE_MOCK = false;

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
    if (USE_MOCK) {
      await this.simulateDelay();
      return mockSearch(params);
    }
    try {
      return await this.request<SearchResult>('/api/search', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch {
      return mockSearch(params);
    }
  }

  async chat(query: string, location?: Coordinate): Promise<ChatResponse> {
    if (USE_MOCK) {
      await this.simulateDelay(800);
      return getMockChatResponse(query);
    }
    try {
      return await this.request<ChatResponse>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ query, location }),
      });
    } catch {
      return getMockChatResponse(query);
    }
  }

  async getPOI(id: string): Promise<POI> {
    if (USE_MOCK) {
      await this.simulateDelay();
      const poi = mockGetPOI(id);
      if (!poi) throw new Error('POI not found');
      return poi;
    }
    try {
      return await this.request<POI>(`/api/poi/${id}`);
    } catch {
      const poi = mockGetPOI(id);
      if (!poi) throw new Error('POI not found');
      return poi;
    }
  }

  async getCategories(): Promise<Category[]> {
    if (USE_MOCK) {
      await this.simulateDelay();
      return mockCategories;
    }
    try {
      return await this.request<Category[]>('/api/categories');
    } catch {
      return mockCategories;
    }
  }

  async buildRoute(params: {
    start?: Coordinate;
    end?: Coordinate;
    waypoints?: Coordinate[];
    mode?: TransportMode;
  }): Promise<RouteResponse> {
    if (USE_MOCK) {
      await this.simulateDelay(500);
      // Для простого buildRoute используем первые POI
      return mockBuildRoute({
        poi_ids: mockPOIs.slice(0, 3).map(p => p.id),
        start: params.start,
        mode: params.mode,
      });
    }
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
    if (USE_MOCK) {
      await this.simulateDelay(600);
      const searchResult = mockSearch({ query: params.query, limit: params.limit || 5 });
      return mockBuildRoute({
        poi_ids: searchResult.pois.map(p => p.id),
        start: params.start,
        mode: params.mode,
      });
    }
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
    if (USE_MOCK) {
      await this.simulateDelay(500);
      return mockBuildRoute(params);
    }
    try {
      return await this.request<RouteResponse>('/api/route/pois', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch {
      return mockBuildRoute(params);
    }
  }

  private simulateDelay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const api = new ApiClient(API_URL);
