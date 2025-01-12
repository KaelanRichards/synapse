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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (initialNote?.id && content !== initialNote.content) {
          setSaveStatus('saving');
          updateNote.mutate(
            { id: initialNote.id, content },
            {
              onSuccess: () => setSaveStatus('saved'),
              onError: () => setSaveStatus('unsaved'),
            }
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
      {/* Clean writing canvas */}
      <div className="max-w-2xl mx-auto px-4 py-16 relative">
        {/* Save status indicator */}
        <div
          className={cn(
            'absolute top-4 right-4 px-3 py-1 rounded-full text-sm transition-all duration-normal',
            {
              'bg-green-100 text-green-800': saveStatus === 'saved',
              'bg-yellow-100 text-yellow-800': saveStatus === 'saving',
              'bg-red-100 text-red-800': saveStatus === 'unsaved',
            }
          )}
        >
          {saveStatus === 'saved' && 'Saved'}
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'unsaved' && 'Unsaved'}
        </div>

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

        {/* Keyboard shortcut hint */}
        <div className="absolute bottom-4 right-4 text-sm text-ink-faint">
          Press ⌘S to save
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
