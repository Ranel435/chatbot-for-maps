import { useCategories } from '../../../entities/category';
import { cn } from '../../../shared/lib/cn';

interface CategoryFilterProps {
  selected: string[];
  onChange: (categories: string[]) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const { data: categories, isLoading } = useCategories();

  const toggleCategory = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((c) => c !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-10 bg-white/10 rounded-lg" />;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories?.map((category) => (
        <button
          key={category.id}
          onClick={() => toggleCategory(category.id)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            selected.includes(category.id)
              ? 'bg-white text-black'
              : 'bg-white/10 text-white/80 hover:bg-white/20'
          )}
        >
          {category.name_ru}
        </button>
      ))}
    </div>
  );
}










