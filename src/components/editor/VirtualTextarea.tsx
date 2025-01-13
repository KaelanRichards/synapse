import React from 'react';
import { Textarea } from '@/components/ui';
import type { Selection } from './types';

interface VirtualTextareaProps {
  content: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSelect: (selection: Selection) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export const VirtualTextarea: React.FC<VirtualTextareaProps> = ({
  content,
  onChange,
  onSelect,
  textareaRef,
}) => {
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    console.log('Selection event fired');
    const textarea = e.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value.slice(start, end);

    console.log('Selection details:', { start, end, text });
    onSelect({ start, end, text });
  };

  return (
    <Textarea
      ref={textareaRef}
      value={content}
      onChange={onChange}
      onSelect={handleSelect}
      onMouseUp={handleSelect}
      onKeyUp={handleSelect}
      className="w-full h-full min-h-screen p-4 bg-transparent resize-none focus:outline-none"
    />
  );
};
