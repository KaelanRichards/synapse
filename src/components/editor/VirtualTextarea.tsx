import React from 'react';
import { Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import { useTextSelection } from '@/hooks/useTextSelection';

interface VirtualTextareaProps {
  content: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSelect: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  isLocalFocusMode: boolean;
  isParagraphFocus: boolean;
  className?: string;
}

export const VirtualTextarea: React.FC<VirtualTextareaProps> = ({
  content,
  onChange,
  onSelect,
  textareaRef,
  isLocalFocusMode,
  isParagraphFocus,
  className,
}) => {
  const { parentRef, totalSize } = useVirtualScroll(content);
  const { handleSmartSelect } = useTextSelection();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      handleSmartSelect(e, textareaRef.current);
    }

    // Handle tab
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart, selectionEnd } = textarea;
      const newContent =
        content.substring(0, selectionStart) +
        '  ' +
        content.substring(selectionEnd);

      const event = {
        target: {
          value: newContent,
          selectionStart: selectionStart + 2,
          selectionEnd: selectionStart + 2,
        },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      onChange(event);
    }
  };

  return (
    <div
      ref={parentRef}
      className={cn(
        'w-full max-w-3xl mx-auto px-4 py-8',
        isLocalFocusMode && 'prose dark:prose-invert',
        isParagraphFocus && 'prose-lg'
      )}
      style={{
        height: `${totalSize}px`,
        position: 'relative',
      }}
    >
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onSelect={onSelect}
        className={cn(
          'w-full h-full resize-none bg-transparent',
          'focus:ring-0 focus:outline-none',
          'font-mono text-lg leading-relaxed',
          'selection:bg-blue-100 dark:selection:bg-blue-900',
          isLocalFocusMode && 'prose dark:prose-invert',
          isParagraphFocus && 'prose-lg',
          className
        )}
        style={{
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
        }}
      />
    </div>
  );
};
