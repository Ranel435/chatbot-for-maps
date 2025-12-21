import { useCallback } from 'react';
import { Header } from '../../../widgets/header';
import { MapWidget } from '../../../widgets/map';
import { ChatWidget } from '../../../widgets/chat';
import { useRouteStore } from '../../../entities/route';
import { usePOIStore } from '../../../entities/poi';
import type { POI } from '../../../shared/types';

export function ChatPage() {
  const { routePOIs } = useRouteStore();
  const { setSelectedPOI } = usePOIStore();

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

        <aside className="absolute left-0 top-0 bottom-0 w-96 bg-black/75 backdrop-blur-sm border-r border-white/10 flex flex-col z-10 overflow-hidden">
          <ChatWidget className="flex-1" />
        </aside>
      </main>
    </div>
  );
}



