import { TextareaHTMLAttributes, forwardRef, useEffect, useRef } from 'react';
import { cn } from '@/shared/utils/';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize, label, error, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        const adjustHeight = () => {
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
        };
        textarea.addEventListener('input', adjustHeight);
        adjustHeight();
        return () => textarea.removeEventListener('input', adjustHeight);
      }
    }, [autoResize]);

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-ink-rich dark:text-ink-inverse">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'flex w-full rounded-md border border-ink-faint bg-surface-pure px-3 py-2 text-sm shadow-subtle transition-all duration-normal ease-gentle',
            'text-ink-rich dark:text-ink-inverse dark:bg-surface-dark dark:border-ink-faint/20',
            'min-h-[80px] resize-none',
            'ring-offset-surface-pure dark:ring-offset-surface-dark',
            'placeholder:text-ink-muted dark:placeholder:text-ink-muted/70',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:shadow-floating',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-accent-error focus-visible:ring-accent-error',
            className
          )}
          ref={autoResize ? textareaRef : ref}
          {...props}
        />
        {error && <p className="text-sm text-accent-error">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
