import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'primary';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-white/10 text-white hover:bg-white/20': variant === 'default',
            'text-white/60 hover:text-white hover:bg-white/10': variant === 'ghost',
            'bg-white text-black hover:bg-white/90': variant === 'primary',
          },
          {
            'w-8 h-8': size === 'sm',
            'w-10 h-10': size === 'md',
            'w-12 h-12': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

