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
          <label className="text-sm font-medium text-mist-black">{label}</label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-garden-thread bg-mist-white px-3 py-2 text-sm text-mist-black shadow-light-mist transition-all duration-medium ease-flow',
            'ring-offset-mist-white file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-mist-black/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-light focus-visible:shadow-deep-well',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error-500 focus-visible:ring-error-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-error-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
