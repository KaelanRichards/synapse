import React, { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useNoteMutations } from '@/hooks/useNoteMutations';
import { useEditor } from '@/contexts/EditorContext';
import { useEditorState } from '@/hooks/useEditorState';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useRouter } from 'next/router';
import { EditorToolbar } from './EditorToolbar';
import { FormatToolbar } from './FormatToolbar';
import { VirtualTextarea } from './VirtualTextarea';
import AmbientSoundPlayer from '../AmbientSoundPlayer';
import type { FormatType, Selection, NoteEditorProps } from './types';

const SAVE_DELAY = 1000;

export const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote }) => {
  const { updateNote } = useNoteMutations();
  const { state: editorContext, setTypewriterMode } = useEditor();
  const supabase = useSupabase();
  const router = useRouter();

  const handleSave = useCallback(
    (
      content: string,
      setSaveStatus: (status: 'saved' | 'saving' | 'unsaved') => void
    ) => {
      if (!initialNote?.id) return;

      if (content === initialNote.content) return;

      setSaveStatus('saving');
      const timeoutId = setTimeout(() => {
        updateNote.mutate(
          { id: initialNote.id, content },
          {
            onSuccess: () => setSaveStatus('saved'),
            onError: () => setSaveStatus('unsaved'),
          }
        );
      }, SAVE_DELAY);

      return () => clearTimeout(timeoutId);
    },
    [initialNote, updateNote]
  );

  const {
    state,
    textareaRef,
    handleContentChange,
    handleFormat,
    handleSelection,
    undo,
    redo,
    toggleFocusMode,
    toggleParagraphFocus,
    toggleAmbientSound,
    setSaveStatus,
  } = useEditorState({
    initialContent: initialNote?.content ?? '',
    onChange: content => handleSave(content, setSaveStatus),
    onFormat: (type: FormatType, selection: Selection) => {
      // Additional format handling if needed
    },
  });

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin');
      }
    };
    checkAuth();
  }, [router, supabase]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            undo();
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'f':
            e.preventDefault();
            toggleFocusMode();
            break;
          case 'p':
            e.preventDefault();
            toggleParagraphFocus();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [undo, redo, toggleFocusMode, toggleParagraphFocus]);

  return (
    <div
      className={cn(
        'relative w-full h-full min-h-screen',
        state.isLocalFocusMode && 'bg-neutral-50 dark:bg-neutral-900',
        state.isParagraphFocus && 'prose-lg'
      )}
    >
      <EditorToolbar
        saveStatus={state.saveStatus}
        stats={state.stats}
        isLocalFocusMode={state.isLocalFocusMode}
        isAmbientSound={state.isAmbientSound}
        isTypewriterMode={editorContext.typewriterMode.enabled}
        onToggleFocusMode={toggleFocusMode}
        onToggleAmbientSound={toggleAmbientSound}
        onToggleTypewriterMode={() =>
          setTypewriterMode({
            enabled: !editorContext.typewriterMode.enabled,
          })
        }
      />

      <VirtualTextarea
        content={state.content}
        onChange={handleContentChange}
        onSelect={handleSelection}
        textareaRef={textareaRef}
        isLocalFocusMode={state.isLocalFocusMode}
        isParagraphFocus={state.isParagraphFocus}
      />

      {state.isAmbientSound && (
        <AmbientSoundPlayer
          isPlaying={state.isAmbientSound}
          onClose={toggleAmbientSound}
        />
      )}

      {state.showToolbar && (
        <FormatToolbar
          position={state.toolbarPosition}
          onFormat={handleFormat}
        />
      )}
    </div>
  );
};
