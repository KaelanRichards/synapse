import React, { useEffect, useState } from 'react';
import { Textarea, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useNoteMutations } from '@/hooks/useNoteMutations';
import { useEditor } from '@/contexts/EditorContext';
import type { Note } from '@/types/supabase';
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  CheckIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

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
  const [isLocalFocusMode, setIsLocalFocusMode] = useState(false);
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

  // Handle Escape key to exit local focus mode
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLocalFocusMode) {
        setIsLocalFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isLocalFocusMode]);

  const SaveStatusIcon = {
    saved: CheckIcon,
    saving: CloudArrowUpIcon,
    unsaved: ExclamationCircleIcon,
  }[saveStatus];

  const getStatusVariant = (
    status: typeof saveStatus
  ): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'saved':
        return 'success';
      case 'saving':
        return 'warning';
      case 'unsaved':
        return 'error';
    }
  };

  const statusVariant = getStatusVariant(saveStatus);

  return (
    <div
      className={cn(
        'h-full w-full transition-all duration-normal ease-gentle',
        'bg-surface-pure',
        'flex flex-col',
        isLocalFocusMode && 'bg-opacity-98'
      )}
    >
      {/* Editor Header */}
      <div
        className={cn(
          'flex items-center justify-between px-6 py-3 shrink-0',
          'border-b border-ink-faint/20',
          'transition-opacity duration-normal',
          isLocalFocusMode && 'opacity-0 hover:opacity-100'
        )}
      >
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-medium text-ink-rich">
            {initialNote?.title || 'Untitled Note'}
          </h1>
          <div className="flex items-center space-x-1.5">
            <SaveStatusIcon className="h-4 w-4" />
            <Badge variant={statusVariant}>
              {saveStatus === 'saved'
                ? 'Saved'
                : saveStatus === 'saving'
                  ? 'Saving...'
                  : 'Unsaved'}
            </Badge>
          </div>
        </div>
        <button
          onClick={() => setIsLocalFocusMode(!isLocalFocusMode)}
          className={cn(
            'p-1.5 rounded-md transition-all duration-normal ease-gentle',
            'text-ink-muted hover:text-ink-rich',
            'hover:bg-surface-faint',
            isLocalFocusMode &&
              'text-accent-primary hover:text-accent-primary/90'
          )}
          title={isLocalFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
        >
          {isLocalFocusMode ? (
            <ArrowsPointingOutIcon className="h-5 w-5" />
          ) : (
            <ArrowsPointingInIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <div
          className={cn(
            'max-w-2xl mx-auto transition-all duration-normal ease-gentle',
            isLocalFocusMode ? 'px-4 py-12' : 'px-6 py-8'
          )}
        >
          <Textarea
            value={content}
            onChange={e => {
              setContent(e.target.value);
              setSaveStatus('unsaved');
            }}
            placeholder="Begin writing..."
            className={cn(
              'w-full min-h-[calc(100vh-16rem)] bg-transparent border-0 focus:ring-0',
              'resize-none focus:outline-none',
              'text-ink-rich',
              'transition-all duration-normal ease-gentle',
              'tracking-normal',
              {
                'font-serif': editorState.fontFamily === 'serif',
                'font-sans': editorState.fontFamily === 'sans',
                'font-mono': editorState.fontFamily === 'mono',
              },
              isLocalFocusMode && 'text-lg leading-loose'
            )}
            style={{
              fontSize: isLocalFocusMode
                ? `${editorState.fontSize + 2}px`
                : `${editorState.fontSize}px`,
              lineHeight: isLocalFocusMode ? '1.8' : '1.75',
            }}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
