import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../../pages/home';
import { ExplorePage } from '../../pages/explore';
import { ChatPage } from '../../pages/chat';
import { RoutePage } from '../../pages/route';
import { POIDetailPage } from '../../pages/poi-detail';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/route" element={<RoutePage />} />
      <Route path="/poi/:id" element={<POIDetailPage />} />
    </Routes>
  );
}










