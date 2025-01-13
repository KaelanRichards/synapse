import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-all duration-normal ease-gentle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-accent-primary text-ink-inverse hover:bg-accent-primary/90 shadow-subtle hover:shadow-floating',
        secondary:
          'bg-surface-faint text-ink-rich hover:bg-surface-dim shadow-subtle dark:bg-surface-dark dark:text-ink-inverse dark:hover:bg-surface-dim/10',
        outline:
          'border border-ink-faint bg-transparent hover:bg-surface-faint text-ink-rich dark:text-ink-inverse dark:border-ink-faint/20 dark:hover:bg-surface-dim/10',
        ghost:
          'hover:bg-surface-faint text-ink-rich dark:text-ink-inverse dark:hover:bg-surface-dim/10',
        danger: 'bg-accent-error text-ink-inverse hover:bg-accent-error/90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
