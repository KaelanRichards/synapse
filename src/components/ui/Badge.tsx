import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-medium ease-flow focus:outline-none focus:ring-2 focus:ring-water-light focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-water-light/15 text-water-deep border border-water-light/30',
        secondary: 'bg-mist-gray/15 text-mist-black border border-mist-gray/30',
        success:
          'bg-garden-green/15 text-garden-green border border-garden-green/30',
        error: 'bg-error-100 text-error-600 border border-error-200',
        warning:
          'bg-garden-thread/15 text-mist-black border border-garden-thread/30',
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
