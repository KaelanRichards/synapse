import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/utils/';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-ink-rich dark:text-ink-inverse">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-ink-faint bg-surface-pure px-3 py-2 text-sm shadow-subtle transition-all duration-normal ease-gentle',
            'text-ink-rich dark:text-ink-inverse dark:bg-surface-dark dark:border-ink-faint/20',
            'ring-offset-surface-pure dark:ring-offset-surface-dark',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-ink-muted dark:placeholder:text-ink-muted/70',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:shadow-floating',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-accent-error focus-visible:ring-accent-error',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-accent-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
