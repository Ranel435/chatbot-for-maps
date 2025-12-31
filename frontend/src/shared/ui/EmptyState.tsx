import { type ReactNode } from 'react';
import { cn } from '../lib/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && (
        <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-white/5 text-white/40">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-white/60 max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

// Готовые пустые состояния
export function EmptyFavorites({ action }: { action?: ReactNode }) {
  return (
    <EmptyState
      icon={
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      }
      title="Нет избранных мест"
      description="Добавляйте интересные места в избранное, чтобы быстро к ним возвращаться"
      action={action}
    />
  );
}

export function EmptySearch({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      }
      title="Ничего не найдено"
      description={query ? `По запросу "${query}" ничего не найдено. Попробуйте изменить запрос.` : 'Попробуйте изменить параметры поиска'}
    />
  );
}

export function EmptyRoute() {
  return (
    <EmptyState
      icon={
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="22,12 18,12" />
          <polyline points="6,12 2,12" />
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="8" />
          <line x1="12" y1="16" x2="12" y2="22" />
        </svg>
      }
      title="Маршрут не построен"
      description="Постройте маршрут через чат или добавьте точки вручную"
    />
  );
}

