import React from 'react';
import { Textarea } from '@/components/ui';
import type { Selection } from './types';

interface VirtualTextareaProps {
  content: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSelect: (selection: Selection) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  isLocalFocusMode: boolean;
  isParagraphFocus: boolean;
}

export const VirtualTextarea: React.FC<VirtualTextareaProps> = ({
  content,
  onChange,
  onSelect,
  textareaRef,
  isLocalFocusMode,
  isParagraphFocus,
}) => {
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value.slice(start, end);

    onSelect({ start, end, text });
  };

  return (
    <Textarea
      ref={textareaRef}
      value={content}
      onChange={onChange}
      onSelect={handleSelect}
      className="w-full h-full min-h-screen p-4 bg-transparent resize-none focus:outline-none"
      style={{
        opacity: isLocalFocusMode ? 0.7 : 1,
        fontSize: isParagraphFocus ? '1.125rem' : '1rem',
      }}
    />
  );
};
