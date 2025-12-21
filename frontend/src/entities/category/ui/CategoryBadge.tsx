import { cn } from '../../../shared/lib/cn';
import type { Category } from '../../../shared/types';

interface CategoryBadgeProps {
  category: Category | string;
  size?: 'sm' | 'md';
  className?: string;
}

const categoryColors: Record<string, string> = {
  religious: 'bg-purple-100 text-purple-700',
  church: 'bg-purple-100 text-purple-700',
  military: 'bg-red-100 text-red-700',
  memorial: 'bg-red-100 text-red-700',
  architecture: 'bg-amber-100 text-amber-700',
  manor: 'bg-amber-100 text-amber-700',
  trails: 'bg-green-100 text-green-700',
};

export function CategoryBadge({ category, size = 'md', className }: CategoryBadgeProps) {
  const id = typeof category === 'string' ? category : category.id;
  const name = typeof category === 'string' ? category : category.name_ru;
  const colorClass = categoryColors[id] || 'bg-gray-100 text-gray-700';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        colorClass,
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
        },
        className
      )}
    >
      {name}
    </span>
  );
}










