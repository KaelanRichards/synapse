import React, { useEffect } from 'react';
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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleSearch = (e: Event) => {
      const { searchTerm } = (e as CustomEvent).detail;
      textarea.dispatchEvent(
        new CustomEvent('editor:search', { detail: { searchTerm } })
      );
    };

    const handleReplace = (e: Event) => {
      const { replaceTerm } = (e as CustomEvent).detail;
      textarea.dispatchEvent(
        new CustomEvent('editor:replace', { detail: { replaceTerm } })
      );
    };

    const handleFindNext = () => {
      textarea.dispatchEvent(new CustomEvent('editor:findNext'));
    };

    const handleFindPrevious = () => {
      textarea.dispatchEvent(new CustomEvent('editor:findPrevious'));
    };

    const handleReplaceOne = () => {
      textarea.dispatchEvent(new CustomEvent('editor:replace'));
    };

    const handleReplaceAll = () => {
      textarea.dispatchEvent(new CustomEvent('editor:replaceAll'));
    };

    const handleToggleCaseSensitive = () => {
      textarea.dispatchEvent(new CustomEvent('editor:toggleCaseSensitive'));
    };

    const handleToggleRegex = () => {
      textarea.dispatchEvent(new CustomEvent('editor:toggleRegex'));
    };

    textarea.addEventListener('search', handleSearch);
    textarea.addEventListener('replace', handleReplace);
    textarea.addEventListener('findNext', handleFindNext);
    textarea.addEventListener('findPrevious', handleFindPrevious);
    textarea.addEventListener('replace', handleReplaceOne);
    textarea.addEventListener('replaceAll', handleReplaceAll);
    textarea.addEventListener('toggleCaseSensitive', handleToggleCaseSensitive);
    textarea.addEventListener('toggleRegex', handleToggleRegex);

    return () => {
      textarea.removeEventListener('search', handleSearch);
      textarea.removeEventListener('replace', handleReplace);
      textarea.removeEventListener('findNext', handleFindNext);
      textarea.removeEventListener('findPrevious', handleFindPrevious);
      textarea.removeEventListener('replace', handleReplaceOne);
      textarea.removeEventListener('replaceAll', handleReplaceAll);
      textarea.removeEventListener(
        'toggleCaseSensitive',
        handleToggleCaseSensitive
      );
      textarea.removeEventListener('toggleRegex', handleToggleRegex);
    };
  }, [textareaRef]);

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
