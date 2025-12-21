import { useState } from 'react';
import { cn } from '../../../shared/lib/cn';
import { Button } from '../../../shared/ui';
import type { ChatMessage, POI, SearchResult } from '../../../shared/types';

interface MessageBubbleProps {
  message: ChatMessage;
  onBuildRoute?: (pois: POI[]) => void;
}

function isSearchResult(data: unknown): data is SearchResult {
  return (
    typeof data === 'object' &&
    data !== null &&
    'pois' in data &&
    Array.isArray((data as SearchResult).pois)
  );
}

export function MessageBubble({ message, onBuildRoute }: MessageBubbleProps) {
  const [expanded, setExpanded] = useState(false);
  const isUser = message.role === 'user';
  const searchData = !isUser && message.data && isSearchResult(message.data) ? message.data : null;
  const hasPOIs = searchData && searchData.pois.length > 0;

  const displayPOIs = hasPOIs
    ? expanded
      ? searchData.pois
      : searchData.pois.slice(0, 5)
    : [];

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2',
          isUser
            ? 'bg-white text-black rounded-br-md'
            : 'bg-white/10 text-white rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {hasPOIs && (
          <div className="mt-3 space-y-2">
            <div className="text-xs text-white/60 font-medium">
              Найдено мест: {searchData.pois.length}
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {displayPOIs.map((poi, idx) => (
                <div key={poi.id} className="text-xs bg-white/10 rounded px-2 py-1">
                  {idx + 1}. {poi.name}
                </div>
              ))}
            </div>
            {searchData.pois.length > 5 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-white/50 hover:text-white underline"
              >
                {expanded ? 'Скрыть' : `Показать все (${searchData.pois.length})`}
              </button>
            )}
            {onBuildRoute && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onBuildRoute(searchData.pois)}
                className="mt-2 w-full"
              >
                Построить маршрут
              </Button>
            )}
          </div>
        )}

        <span
          className={cn(
            'text-xs mt-1 block',
            isUser ? 'text-black/50' : 'text-white/40'
          )}
        >
          {message.timestamp.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}










