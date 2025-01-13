import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-ink-rich">{label}</label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-ink-faint bg-surface-pure px-3 py-2 text-sm text-ink-rich shadow-subtle transition-all duration-normal ease-gentle',
            'ring-offset-surface-pure file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-ink-muted',
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
