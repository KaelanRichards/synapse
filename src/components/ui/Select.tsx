import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, children, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-ink-rich dark:text-ink-inverse">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              'flex h-10 w-full appearance-none rounded-md border border-ink-faint bg-surface-pure px-3 py-2 pr-8 text-sm shadow-subtle transition-all duration-normal ease-gentle',
              'text-ink-rich dark:text-ink-inverse dark:bg-surface-dark dark:border-ink-faint/20',
              'ring-offset-surface-pure dark:ring-offset-surface-dark',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:shadow-floating',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-accent-error focus-visible:ring-accent-error',
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted dark:text-ink-muted/70" />
        </div>
        {error && <p className="text-sm text-accent-error">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
