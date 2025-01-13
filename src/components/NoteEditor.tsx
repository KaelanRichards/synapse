import React, { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useNoteMutations } from '@/hooks/useNoteMutations';
import { useEditor } from '@/contexts/EditorContext';
import type { Note } from '@/types/supabase';

interface NoteEditorProps {
  initialNote?: {
    id?: string;
    title: string;
    content: string;
    maturity_state: Note['maturity_state'];
  };
}

const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote }) => {
  const [content, setContent] = useState(initialNote?.content ?? '');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>(
    'saved'
  );
  const { updateNote } = useNoteMutations();
  const { state: editorState } = useEditor();

  // Update content when initialNote changes
  useEffect(() => {
    if (initialNote?.content) {
      setContent(initialNote.content);
    }
  }, [initialNote?.content]);

  // Save debounce timer
  useEffect(() => {
    if (!initialNote?.id) return;
    const noteId = initialNote.id;

    const timer = setTimeout(() => {
      if (content !== initialNote.content) {
        setSaveStatus('saving');
        updateNote.mutate(
          { id: noteId, content },
          {
            onSuccess: () => setSaveStatus('saved'),
            onError: () => setSaveStatus('unsaved'),
          }
        );
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, initialNote, updateNote]);

  return (
    <div
      className={cn(
        'min-h-screen transition-colors duration-normal',
        editorState.mode === 'focus'
          ? 'bg-surface-pure dark:bg-surface-dark'
          : 'bg-surface-pure/80 dark:bg-surface-dark/80'
      )}
    >
      <div className="max-w-2xl mx-auto px-4 py-16 relative">
        <Textarea
          value={content}
          onChange={e => {
            setContent(e.target.value);
            setSaveStatus('unsaved');
          }}
          placeholder="Begin writing..."
          className={cn(
            'w-full min-h-[80vh] bg-transparent border-0 focus:ring-0',
            'resize-none focus:outline-none',
            'text-ink-rich dark:text-ink-inverse',
            'transition-all duration-normal',
            'tracking-normal leading-relaxed',
            {
              'font-serif': editorState.fontFamily === 'serif',
              'font-sans': editorState.fontFamily === 'sans',
              'font-mono': editorState.fontFamily === 'mono',
            }
          )}
          style={{
            fontSize: `${editorState.fontSize}px`,
            lineHeight: '1.75',
          }}
          autoFocus
        />
      </div>
    </div>
  );
};

export default NoteEditor;
