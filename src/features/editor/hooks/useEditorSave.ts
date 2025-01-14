import { useCallback, useState, useEffect, useRef } from 'react';
import { useNoteMutations } from '@/features/notes/hooks/useNoteMutations';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $setSelection,
} from 'lexical';
import type { LexicalEditor, RangeSelection } from 'lexical';

interface UseEditorSaveProps {
  noteId: string;
  editor: LexicalEditor | null;
  title: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const SAVE_DEBOUNCE = 1000;
const MIN_SAVE_INTERVAL = 2000;

export function useEditorSave({ noteId, editor, title }: UseEditorSaveProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { updateNote } = useNoteMutations();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveAttemptRef = useRef<number>(0);
  const pendingChangesRef = useRef(false);
  const unmountingRef = useRef(false);

  const saveNote = useCallback(
    async (retryCount = 0) => {
      if (!noteId || !editor) {
        console.debug('Save skipped - missing noteId or editor');
        return;
      }

      const now = Date.now();
      const timeSinceLastSave = now - lastSaveAttemptRef.current;

      // Skip if too soon and not a retry attempt
      if (timeSinceLastSave < MIN_SAVE_INTERVAL && retryCount === 0) {
        console.debug('Save deferred - too soon since last save');
        pendingChangesRef.current = true;

        // Schedule a save for when the interval has passed
        const delay = MIN_SAVE_INTERVAL - timeSinceLastSave;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => saveNote(), delay);
        return;
      }

      // Skip if already saving (unless it's a retry)
      if (isSaving && retryCount === 0) {
        console.debug('Save deferred - already in progress');
        pendingChangesRef.current = true;
        return;
      }

      try {
        setIsSaving(true);
        setSaveError(null);
        lastSaveAttemptRef.current = now;
        pendingChangesRef.current = false;

        // Capture current selection state
        let selectionToRestore: RangeSelection | null = null;
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selectionToRestore = selection.clone();
          }
        });

        const editorState = editor.getEditorState();
        const textContent = editorState.read(() => $getRoot().getTextContent());
        const serializedState = editorState.toJSON();

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

        // Restore selection state if needed
        if (selectionToRestore) {
          editor.update(() => {
            $setSelection(selectionToRestore);
          });
        }

        // Only clear unsaved changes if we're not unmounting and no new changes came in
        if (!unmountingRef.current && !pendingChangesRef.current) {
          setHasUnsavedChanges(false);
        }
      } catch (error) {
        console.error('Save failed:', error);
        setSaveError(
          error instanceof Error ? error.message : 'Failed to save note'
        );

        if (retryCount < MAX_RETRIES) {
          const retryDelay = RETRY_DELAY * Math.pow(2, retryCount);
          saveTimeoutRef.current = setTimeout(
            () => saveNote(retryCount + 1),
            retryDelay
          );
        }
      } finally {
        setIsSaving(false);

        // If there are pending changes, schedule another save
        if (pendingChangesRef.current && !unmountingRef.current) {
          saveTimeoutRef.current = setTimeout(
            () => saveNote(),
            MIN_SAVE_INTERVAL
          );
        }
      }
    },
    [noteId, editor, title, updateNote, isSaving]
  );

  const onChange = useCallback(() => {
    setHasUnsavedChanges(true);
    pendingChangesRef.current = true;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Schedule new save
    saveTimeoutRef.current = setTimeout(() => {
      saveNote();
    }, SAVE_DEBOUNCE);
  }, [saveNote]);

  // Handle cleanup and final save on unmount
  useEffect(() => {
    return () => {
      unmountingRef.current = true;

      // Clear any pending save timeouts
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // If there are unsaved changes and we're not currently saving, do a final save
      if (hasUnsavedChanges && !isSaving) {
        saveNote();
      }
    };
  }, [hasUnsavedChanges, isSaving, saveNote]);

  return {
    isSaving,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    saveError,
    saveNote,
    onChange,
  };
}
