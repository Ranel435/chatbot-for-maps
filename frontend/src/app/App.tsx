import { Providers } from './providers';
import { AppRouter } from './router';

export function App() {
  return (
    <Providers>
      <div className="min-h-screen bg-surface-50">
        <AppRouter />
      </div>
    </Providers>
  );
}










