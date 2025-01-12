import {
  Dialog,
  Transition,
  DialogPanel,
  Description,
} from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { cn } from '@/lib/utils';
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
          enter="ease-flow duration-medium"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-flow duration-medium"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-mist-black/25 backdrop-blur-xs" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-flow duration-medium"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-flow duration-medium"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className={cn(
                  'w-full max-w-md transform overflow-hidden rounded-lg border border-garden-thread bg-mist-white p-6 text-left shadow-deep-well transition-all duration-medium ease-flow',
                  className
                )}
              >
                {title && (
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-mist-black pr-8"
                  >
                    {title}
                  </Dialog.Title>
                )}

                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-mist-white transition-all duration-medium ease-flow hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-water-light focus:ring-offset-2"
                >
                  <XMarkIcon className="h-4 w-4 text-mist-black" />
                  <span className="sr-only">Close</span>
                </button>

                {description && (
                  <Description className="mt-2 text-sm text-mist-black/70">
                    {description}
                  </Description>
                )}

                <div className="mt-4">{children}</div>
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
