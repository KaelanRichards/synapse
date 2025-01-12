import { TextareaHTMLAttributes, forwardRef, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const handleResize = () => {
      if (!textareaRef.current || !autoResize) return;

      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set the height to scrollHeight to fit the content
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    };

    useEffect(() => {
      if (autoResize) {
        handleResize();
        // Add resize event listener to handle window resizing
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }
    }, [autoResize]);

    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={element => {
          // Handle both forwardRef and local ref
          if (typeof ref === 'function') {
            ref(element);
          } else if (ref) {
            ref.current = element;
          }
          textareaRef.current = element;
        }}
        onChange={e => {
          props.onChange?.(e);
          if (autoResize) {
            handleResize();
          }
        }}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
