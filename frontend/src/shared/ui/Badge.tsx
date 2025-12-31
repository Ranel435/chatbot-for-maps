import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/cn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

const variantStyles = {
  default: 'bg-white/10 text-white/80',
  primary: 'bg-primary-500/20 text-primary-300',
  success: 'bg-green-500/20 text-green-300',
  warning: 'bg-amber-500/20 text-amber-300',
  error: 'bg-red-500/20 text-red-300',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full',
          variantStyles[variant],
          {
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-3 py-1 text-sm': size === 'md',
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

