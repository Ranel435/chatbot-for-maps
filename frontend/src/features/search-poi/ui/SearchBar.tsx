import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '../../../shared/ui';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBar({ 
  onSearch, 
  isLoading, 
  placeholder = 'Поиск мест...', 
  debounceMs = 300 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearch(query.trim());
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, onSearch, debounceMs]);

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pr-8"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
        >
          x
        </button>
      )}
      {isLoading && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}










