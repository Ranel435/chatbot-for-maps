import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../shared/lib/cn';

const navItems = [
  { path: '/', label: 'Главная' },
  { path: '/explore', label: 'Исследовать' },
  { path: '/chat', label: 'Чат' },
  { path: '/route', label: 'Маршрут' },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="bg-black/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl text-white">MapBot</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === item.path
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}










