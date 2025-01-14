import {
  Dialog,
  Transition,
  DialogPanel,
  Description,
} from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { cn } from '@/shared/utils/';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  className,
}: ModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-gentle duration-normal"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-gentle duration-normal"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-ink-pure/25 dark:bg-ink-pure/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-gentle duration-normal"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-gentle duration-normal"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className={cn(
                  'w-full max-w-md transform overflow-hidden rounded-lg bg-surface-pure p-6 shadow-command text-left align-middle transition-all dark:bg-surface-dark dark:shadow-command/20',
                  className
                )}
              >
                {title && (
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-ink-rich dark:text-ink-inverse"
                  >
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Description className="mt-2 text-sm text-ink-muted dark:text-ink-muted/70">
                    {description}
                  </Description>
                )}
                <div className="mt-4">{children}</div>

                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-surface-pure transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 dark:ring-offset-surface-dark"
                >
                  <XMarkIcon className="h-4 w-4 text-ink-muted dark:text-ink-muted/70" />
                  <span className="sr-only">Close</span>
                </button>
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
