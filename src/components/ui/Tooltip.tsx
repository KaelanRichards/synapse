import { ReactNode } from 'react';
import { Transition } from '@headlessui/react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export function Tooltip({
  content,
  children,
  className,
  side = 'top',
  align = 'center',
}: TooltipProps) {
  return (
    <div className="relative inline-block">
      {children}
      <Transition
        show={true}
        enter="transition-opacity duration-normal ease-gentle"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-normal ease-gentle"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className={cn(
            'absolute z-50 px-2 py-1 text-xs font-medium text-ink-inverse bg-ink-rich dark:bg-ink-pure rounded shadow-floating dark:shadow-floating/20',
            {
              'bottom-full mb-2': side === 'top',
              'top-1/2 -translate-y-1/2 left-full ml-2': side === 'right',
              'top-full mt-2': side === 'bottom',
              'top-1/2 -translate-y-1/2 right-full mr-2': side === 'left',
            },
            {
              'left-1/2 -translate-x-1/2':
                (side === 'top' || side === 'bottom') && align === 'center',
              'left-0':
                (side === 'top' || side === 'bottom') && align === 'start',
              'right-0':
                (side === 'top' || side === 'bottom') && align === 'end',
              'top-1/2 -translate-y-1/2':
                (side === 'left' || side === 'right') && align === 'center',
              'top-0':
                (side === 'left' || side === 'right') && align === 'start',
              'bottom-0':
                (side === 'left' || side === 'right') && align === 'end',
            },
            className
          )}
        >
          {content}
          <div
            className={cn(
              'absolute w-2 h-2 bg-ink-rich dark:bg-ink-pure rotate-45',
              {
                'top-full -translate-y-1': side === 'top',
                '-right-1 translate-x-1/2': side === 'left',
                '-left-1 -translate-x-1/2': side === 'right',
                '-top-1 -translate-y-1/2': side === 'bottom',
              },
              {
                'left-1/2 -translate-x-1/2':
                  (side === 'top' || side === 'bottom') && align === 'center',
                'left-[0.75rem]':
                  (side === 'top' || side === 'bottom') && align === 'start',
                'right-[0.75rem]':
                  (side === 'top' || side === 'bottom') && align === 'end',
                'top-1/2 -translate-y-1/2':
                  (side === 'left' || side === 'right') && align === 'center',
                'top-2':
                  (side === 'left' || side === 'right') && align === 'start',
                'bottom-2':
                  (side === 'left' || side === 'right') && align === 'end',
              }
            )}
          />
        </div>
      </Transition>
    </div>
  );
}
