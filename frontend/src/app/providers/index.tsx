import { type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './QueryProvider';
import { ErrorBoundary } from './ErrorBoundary';
import { ToastContainer } from '../../shared/ui';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <BrowserRouter>
          {children}
          <ToastContainer />
        </BrowserRouter>
      </QueryProvider>
    </ErrorBoundary>
  );
}
