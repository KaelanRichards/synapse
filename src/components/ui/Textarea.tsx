import { TextareaHTMLAttributes, forwardRef, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize, label, error, ...props }, ref) => {
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
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-mist-black">{label}</label>
        )}
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-garden-thread bg-mist-white px-3 py-2 text-sm text-mist-black shadow-light-mist transition-all duration-medium ease-flow',
            'ring-offset-mist-white placeholder:text-mist-black/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-light focus-visible:shadow-deep-well',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-none hover:resize-y',
            error && 'border-error-500 focus-visible:ring-error-500',
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
        {error && <p className="text-sm text-error-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
