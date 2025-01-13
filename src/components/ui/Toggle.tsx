import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-normal ease-gentle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent-primary data-[state=on]:text-ink-inverse data-[state=off]:bg-surface-faint data-[state=off]:hover:bg-surface-dim',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border border-ink-faint hover:bg-surface-faint',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ToggleProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, size, pressed, onPressedChange, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        data-state={pressed ? 'on' : 'off'}
        aria-pressed={pressed}
        onClick={() => onPressedChange?.(!pressed)}
        className={cn(toggleVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };
