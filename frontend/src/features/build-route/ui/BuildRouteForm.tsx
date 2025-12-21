import { useState } from 'react';
import { Button, Input } from '../../../shared/ui';
import { useGeolocation } from '../../../shared/lib';
import type { TransportMode, Coordinate } from '../../../shared/types';

interface BuildRouteFormProps {
  onBuild: (query: string, mode: TransportMode, start?: Coordinate) => void;
  isLoading?: boolean;
}

const modes: { value: TransportMode; label: string; icon: string }[] = [
  { value: 'walking', label: 'Пешком', icon: 'W' },
  { value: 'driving', label: 'На машине', icon: 'D' },
  { value: 'cycling', label: 'На велосипеде', icon: 'C' },
];

export function BuildRouteForm({ onBuild, isLoading }: BuildRouteFormProps) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<TransportMode>('walking');
  const [useLocation, setUseLocation] = useState(true);
  const { position, isLoading: geoLoading } = useGeolocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const start = useLocation && position ? position : undefined;
      onBuild(query.trim(), mode, start);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Куда хотите пойти? (напр. старые церкви)"
      />

      <div className="flex gap-2">
        {modes.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            className={`flex-1 py-2 px-3 rounded-lg border transition-colors ${
              mode === m.value
                ? 'border-white bg-white/20 text-white'
                : 'border-white/20 text-white/70 hover:border-white/40'
            }`}
          >
            <span className="font-medium">{m.icon}</span>
            <span className="ml-2 text-sm">{m.label}</span>
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          checked={useLocation}
          onChange={(e) => setUseLocation(e.target.checked)}
          className="rounded border-white/30 bg-white/10"
        />
        <span>
          Начать от моего местоположения
          {geoLoading && ' (определяем...)'}
          {!geoLoading && position && ' (определено)'}
          {!geoLoading && !position && ' (недоступно)'}
        </span>
      </label>

      <Button type="submit" className="w-full" disabled={isLoading || !query.trim()}>
        {isLoading ? 'Строим маршрут...' : 'Построить маршрут'}
      </Button>
    </form>
  );
}










