import { useEffect } from 'react';
import { cn } from '../lib/cn';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white max-w-sm z-50',
        'animate-in slide-in-from-bottom-5 fade-in duration-300',
        {
          'bg-green-600': type === 'success',
          'bg-red-600': type === 'error',
          'bg-primary-600': type === 'info',
        }
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex-1 text-sm">{message}</span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white"
        >
          x
        </button>
      </div>
    </div>
  );
}






