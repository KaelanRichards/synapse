import React, { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui';
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

  return (
    <div
      className={cn(
        'h-full w-full transition-all duration-300',
        'bg-surface-pure dark:bg-surface-dark',
        'flex flex-col',
        isLocalFocusMode && 'bg-opacity-98'
      )}
    >
      {/* Editor Header */}
      <div
        className={cn(
          'flex items-center justify-between px-6 py-3 shrink-0',
          'border-b border-gray-200 dark:border-gray-800',
          'transition-opacity duration-300',
          isLocalFocusMode && 'opacity-0 hover:opacity-100'
        )}
      >
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-medium text-ink-rich dark:text-ink-inverse">
            {initialNote?.title || 'Untitled Note'}
          </h1>
          <div className="flex items-center space-x-1.5 text-xs">
            <SaveStatusIcon
              className={cn(
                'h-4 w-4',
                saveStatus === 'saved'
                  ? 'text-green-500'
                  : saveStatus === 'saving'
                    ? 'text-yellow-500'
                    : 'text-red-500'
              )}
            />
            <span
              className={cn(
                'px-2 py-1 rounded-full',
                saveStatus === 'saved'
                  ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
                  : saveStatus === 'saving'
                    ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20'
                    : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
              )}
            >
              {saveStatus === 'saved'
                ? 'Saved'
                : saveStatus === 'saving'
                  ? 'Saving...'
                  : 'Unsaved'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsLocalFocusMode(!isLocalFocusMode)}
          className={cn(
            'p-1.5 rounded-md transition-all duration-200',
            'text-gray-400 hover:text-neutral-900 dark:hover:text-white',
            'hover:bg-gray-50 dark:hover:bg-gray-800',
            isLocalFocusMode && 'text-primary-500 hover:text-primary-600'
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
            'max-w-2xl mx-auto transition-all duration-300',
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
              'text-ink-rich dark:text-ink-inverse',
              'transition-all duration-300',
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
