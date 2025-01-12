import React, { useEffect } from 'react';
import { Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useEditor } from '@/contexts/EditorContext';

interface NoteEditorProps {
  initialNote?: {
    id?: string;
    title: string;
    content: string;
    maturity_state: 'SEED' | 'SAPLING' | 'GROWTH' | 'MATURE' | 'EVOLVING';
  };
}

const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote }) => {
  const { state, currentNote, updateNote } = useEditor();

  // Initialize note from props or create new note
  useEffect(() => {
    if (initialNote) {
      updateNote(initialNote.content);
    } else if (!currentNote) {
      updateNote('');
    }
  }, [initialNote, currentNote, updateNote]);

  return (
    <div
      className={cn(
        'min-h-screen transition-colors duration-normal',
        state.mode === 'focus'
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
              'bg-green-100 text-green-800': state.saveStatus === 'saved',
              'bg-yellow-100 text-yellow-800': state.saveStatus === 'saving',
              'bg-red-100 text-red-800': state.saveStatus === 'unsaved',
            }
          )}
        >
          {state.saveStatus === 'saved' && 'Saved'}
          {state.saveStatus === 'saving' && 'Saving...'}
          {state.saveStatus === 'unsaved' && 'Unsaved'}
        </div>

        <Textarea
          value={currentNote?.content || ''}
          onChange={e => updateNote(e.target.value)}
          placeholder="Begin writing..."
          className={cn(
            'w-full min-h-[80vh] bg-transparent border-0 focus:ring-0',
            'resize-none focus:outline-none',
            'text-ink-rich dark:text-ink-inverse',
            'transition-all duration-normal',
            {
              'font-serif': state.fontFamily === 'serif',
              'font-sans': state.fontFamily === 'sans',
              'font-mono': state.fontFamily === 'mono',
            }
          )}
          style={{
            fontSize: `${state.fontSize}px`,
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
