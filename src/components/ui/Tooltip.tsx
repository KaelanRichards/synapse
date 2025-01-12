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
  const positions = {
    top: 'bottom-full mb-2',
    right: 'left-full ml-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
  };

  const alignments = {
    start: side === 'top' || side === 'bottom' ? 'left-0' : 'top-0',
    center:
      side === 'top' || side === 'bottom'
        ? 'left-1/2 -translate-x-1/2'
        : 'top-1/2 -translate-y-1/2',
    end: side === 'top' || side === 'bottom' ? 'right-0' : 'bottom-0',
  };

  return (
    <div className="relative group inline-flex">
      {children}
      <Transition
        as="div"
        show={true}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
        className={cn(
          'absolute z-50 hidden group-hover:block',
          positions[side],
          alignments[align],
          'px-2 py-1 text-xs font-medium text-white bg-neutral-900 rounded-md shadow-sm',
          className
        )}
      >
        {content}
        <div
          className={cn(
            'absolute w-2 h-2 bg-neutral-900 rotate-45',
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
      </Transition>
    </div>
  );
}
