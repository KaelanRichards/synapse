import { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:h-5 [&>svg]:w-5 shadow-subtle',
  {
    variants: {
      variant: {
        default:
          'bg-surface-faint text-ink-rich border-ink-faint [&>svg]:text-ink-rich dark:bg-surface-dark dark:text-ink-inverse dark:border-ink-faint/20',
        success:
          'bg-accent-success/10 text-ink-rich border-accent-success/20 [&>svg]:text-accent-success dark:text-ink-inverse',
        error:
          'bg-accent-error/10 text-ink-rich border-accent-error/20 [&>svg]:text-accent-error dark:text-ink-inverse',
        warning:
          'bg-accent-warning/10 text-ink-rich border-accent-warning/20 [&>svg]:text-accent-warning dark:text-ink-inverse',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const icons = {
  default: InformationCircleIcon,
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  onClose?: () => void;
  title?: string;
}

export function Alert({
  className,
  variant = 'default',
  onClose,
  children,
  title,
  ...props
}: AlertProps) {
  const Icon = icons[variant || 'default'];

  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon />
      <div className="flex-1">
        {title && (
          <h5 className="mb-1 font-medium leading-none tracking-tight text-ink-rich dark:text-ink-inverse">
            {title}
          </h5>
        )}
        <div className="text-sm text-ink-muted dark:text-ink-muted/70">
          {children}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-surface-pure transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 dark:ring-offset-surface-dark"
        >
          <XMarkIcon className="h-4 w-4 text-ink-muted dark:text-ink-muted/70" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
}
