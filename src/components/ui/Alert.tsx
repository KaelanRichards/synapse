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
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:h-5 [&>svg]:w-5',
  {
    variants: {
      variant: {
        default:
          'bg-neutral-50 text-neutral-900 border-neutral-200 [&>svg]:text-neutral-900',
        success:
          'bg-success-50 text-success-900 border-success-200 [&>svg]:text-success-900',
        error:
          'bg-error-50 text-error-900 border-error-200 [&>svg]:text-error-900',
        warning:
          'bg-warning-50 text-warning-900 border-warning-200 [&>svg]:text-warning-900',
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
          <h5 className="mb-1 font-medium leading-none tracking-tight">
            {title}
          </h5>
        )}
        <div className="text-sm [&_p]:leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
        >
          <XMarkIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
}
