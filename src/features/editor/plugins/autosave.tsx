import React, { useCallback, useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  RangeSelection,
} from 'lexical';
import { useNoteMutations } from '@/features/notes/hooks/useNoteMutations';
import { useEditorStore } from '../store/editorStore';

interface AutosavePluginProps {
  noteId: string;
  title: string;
  onSaveStart?: () => void;
  onSaveComplete?: () => void;
  onSaveError?: (error: Error) => void;
}

const SAVE_DEBOUNCE = 500;
const MIN_SAVE_INTERVAL = 2000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function AutosavePlugin({
  noteId,
  title,
  onSaveStart,
  onSaveComplete,
  onSaveError,
}: AutosavePluginProps) {
  const [editor] = useLexicalComposerContext();
  const { updateNote } = useNoteMutations();
  const { setSaving, setError, setHasUnsavedChanges, setLastSavedAt } =
    useEditorStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveAttemptRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);
  const isSavingRef = useRef<boolean>(false);

  const saveContent = useCallback(
    async (retryCount = 0, force = false) => {
      if (!noteId || (isSavingRef.current && !force)) return;

      const now = Date.now();
      if (
        now - lastSaveAttemptRef.current < MIN_SAVE_INTERVAL &&
        retryCount === 0 &&
        !force
      ) {
        return;
      }

      try {
        isSavingRef.current = true;
        setSaving(true);
        setError(null); // Clear previous errors
        onSaveStart?.();
        lastSaveAttemptRef.current = now;

        // Capture current editor state
        const editorState = editor.getEditorState();
        const textContent = editorState.read(() => $getRoot().getTextContent());
        const serializedState = editorState.toJSON();

        // Save in background without affecting editor state
        await updateNote({
          id: noteId,
          title,
          content: {
            text: textContent,
            editorState: {
              type: 'lexical',
              content: serializedState,
            },
          },
        });

        setHasUnsavedChanges(false);
        setLastSavedAt(new Date());
        onSaveComplete?.();
        retryCountRef.current = 0;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to save note');

        if (retryCount < MAX_RETRIES) {
          setTimeout(
            () => {
              saveContent(retryCount + 1, true);
            },
            RETRY_DELAY * (retryCount + 1)
          );
          return;
        }

        setError(error);
        onSaveError?.(error);
        retryCountRef.current = 0;
      } finally {
        isSavingRef.current = false;
        setSaving(false);
      }
    },
    [
      noteId,
      title,
      editor,
      updateNote,
      setSaving,
      setError,
      setHasUnsavedChanges,
      setLastSavedAt,
      onSaveStart,
      onSaveComplete,
      onSaveError,
    ]
  );

  // Register update listener outside of save operation
  useEffect(() => {
    const removeUpdateListener = editor.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves }) => {
        if (dirtyElements.size > 0 || dirtyLeaves.size > 0) {
          setHasUnsavedChanges(true);

          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }

          const now = Date.now();
          const timeSinceLastSave = now - lastSaveAttemptRef.current;
          const delay = Math.max(
            0,
            Math.min(SAVE_DEBOUNCE, MIN_SAVE_INTERVAL - timeSinceLastSave)
          );

          saveTimeoutRef.current = setTimeout(() => {
            saveContent();
          }, delay);
        }
      }
    );

    return () => {
      removeUpdateListener();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Final save on unmount if there are unsaved changes
      const { hasUnsavedChanges } = useEditorStore.getState();
      if (hasUnsavedChanges) {
        saveContent(0, true);
      }
    };
  }, [editor, saveContent, setHasUnsavedChanges]);

  // Register focus retention
  useEffect(() => {
    const removeFocusListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.dirty = true;
        }
        return false;
      },
      1
    );

    return removeFocusListener;
  }, [editor]);

  return null;
}
