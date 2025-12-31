export interface PresetRoute {
  id: string;
  name: string;
  description: string;
  category: string;
  duration_hours: number;
  distance_km: number;
  difficulty: 'easy' | 'medium' | 'hard';
  poi_ids: string[];
  image?: string;
  tags: string[];
}

