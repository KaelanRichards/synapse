import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-normal ease-gentle focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-accent-primary/15 text-ink-rich dark:text-ink-inverse border border-accent-primary/30',
        secondary:
          'bg-surface-dim/15 text-ink-rich dark:text-ink-inverse border border-surface-dim/30 dark:border-surface-dim/20',
        success:
          'bg-accent-success/15 text-ink-rich dark:text-ink-inverse border border-accent-success/30',
        error:
          'bg-accent-error/15 text-ink-rich dark:text-ink-inverse border border-accent-error/30',
        warning:
          'bg-accent-warning/15 text-ink-rich dark:text-ink-inverse border border-accent-warning/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
