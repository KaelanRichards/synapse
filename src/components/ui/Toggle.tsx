import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked = false, onChange, disabled = false, label, className }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        ref={ref}
        className={cn(
          'group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-primary-600' : 'bg-neutral-200',
          className
        )}
      >
        <span className="sr-only">{label}</span>
        <span
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };
