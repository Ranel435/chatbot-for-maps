import { useState, useCallback } from 'react';
import { Header } from '../../../widgets/header';
import { MapWidget } from '../../../widgets/map';
import { ChatWidget } from '../../../widgets/chat';
import { useRouteStore } from '../../../entities/route';
import { usePOIStore } from '../../../entities/poi';
import { cn } from '../../../shared/lib';
import type { POI } from '../../../shared/types';

export function ChatPage() {
  const { routePOIs } = useRouteStore();
  const { setSelectedPOI } = usePOIStore();
  const [panelOpen, setPanelOpen] = useState(false);

  const handlePOIClick = useCallback((poi: POI) => {
    setSelectedPOI(poi);
  }, [setSelectedPOI]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 relative">
        <MapWidget
          pois={routePOIs}
          onPOIClick={handlePOIClick}
          className="absolute inset-0 z-0"
        />

        {/* Mobile toggle button */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className={cn(
            'md:hidden absolute top-4 left-4 z-30 w-12 h-12 rounded-full bg-black/80 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shadow-lg',
            panelOpen && 'left-[calc(100%-4rem)]'
          )}
          aria-label={panelOpen ? 'Закрыть чат' : 'Открыть чат'}
        >
          {panelOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </button>

        {/* Backdrop for mobile */}
        {panelOpen && (
          <div
            className="md:hidden absolute inset-0 bg-black/50 z-5"
            onClick={() => setPanelOpen(false)}
          />
        )}

        <aside
          className={cn(
            'absolute left-0 top-0 bottom-0 w-full md:w-96 bg-black/90 md:bg-black/75 backdrop-blur-sm border-r border-white/10 flex flex-col z-10 overflow-hidden transition-transform duration-300',
            'md:translate-x-0',
            panelOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Mobile close button inside panel */}
          <button
            onClick={() => setPanelOpen(false)}
            className="md:hidden absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
            aria-label="Закрыть"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <ChatWidget className="flex-1" />
        </aside>
      </main>
    </div>
  );
}




