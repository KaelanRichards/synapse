import React, { useCallback, useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { useNoteMutations } from '@/features/notes/hooks/useNoteMutations';
import { useEditorStore } from '../store/editorStore';

interface AutosavePluginProps {
  noteId: string;
  title: string;
  onSaveStart?: () => void;
  onSaveComplete?: () => void;
  onSaveError?: (error: Error) => void;
}

interface SaveOperation {
  content: string;
  textContent: string;
  timestamp: number;
  attempt: number;
  id: string; // Unique identifier for each save operation
}

const SAVE_DEBOUNCE = 1000;
const MIN_SAVE_INTERVAL = 2000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const MAX_QUEUE_SIZE = 5;

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
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef<boolean>(false);
  const isDirtyRef = useRef<boolean>(false);
  const lastSavedContentRef = useRef<string>('');
  const isUnmountingRef = useRef<boolean>(false);
  const saveQueueRef = useRef<SaveOperation[]>([]);
  const lastSuccessfulSaveRef = useRef<number>(0);

  // Cleanup function for timeouts
  const cleanupTimeouts = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
  }, []);

  const processSaveQueue = useCallback(async () => {
    // Clear any existing processing timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    if (isSavingRef.current || saveQueueRef.current.length === 0) return;

    const now = Date.now();
    if (now - lastSuccessfulSaveRef.current < MIN_SAVE_INTERVAL) {
      // Schedule next processing attempt
      processingTimeoutRef.current = setTimeout(
        processSaveQueue,
        MIN_SAVE_INTERVAL - (now - lastSuccessfulSaveRef.current)
      );
      return;
    }

    isSavingRef.current = true;
    if (!isUnmountingRef.current) {
      setSaving(true);
      setError(null);
    }

    const operation = saveQueueRef.current[0];
    const operationId = operation.id;

    try {
      onSaveStart?.();

      await updateNote({
        id: noteId,
        title,
        content: {
          text: operation.textContent,
          editorState: {
            type: 'lexical',
            content: JSON.parse(operation.content),
          },
        },
      });

      // Verify this operation is still at the front of the queue
      if (
        saveQueueRef.current.length > 0 &&
        saveQueueRef.current[0].id === operationId
      ) {
        // Save was successful
        lastSuccessfulSaveRef.current = Date.now();
        lastSavedContentRef.current = operation.content;
        saveQueueRef.current.shift(); // Remove the successful operation

        if (saveQueueRef.current.length === 0) {
          isDirtyRef.current = false;
          if (!isUnmountingRef.current) {
            setHasUnsavedChanges(false);
            setLastSavedAt(new Date());
          }
        }

        onSaveComplete?.();
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to save note');

      // Verify this operation is still at the front of the queue
      if (
        saveQueueRef.current.length > 0 &&
        saveQueueRef.current[0].id === operationId
      ) {
        // Handle retry logic
        if (operation.attempt < MAX_RETRIES) {
          operation.attempt++;
          const retryDelay = RETRY_DELAY * Math.pow(2, operation.attempt - 1);
          processingTimeoutRef.current = setTimeout(() => {
            isSavingRef.current = false;
            processSaveQueue();
          }, retryDelay);
          return;
        }

        // Max retries reached, remove failed operation and notify
        saveQueueRef.current.shift();
        if (!isUnmountingRef.current) {
          setError(error);
        }
        onSaveError?.(error);
      }
    } finally {
      isSavingRef.current = false;
      if (!isUnmountingRef.current) {
        setSaving(false);
      }

      // Process next item in queue if any
      if (saveQueueRef.current.length > 0) {
        processingTimeoutRef.current = setTimeout(
          processSaveQueue,
          MIN_SAVE_INTERVAL
        );
      }
    }
  }, [
    noteId,
    title,
    updateNote,
    setSaving,
    setError,
    setHasUnsavedChanges,
    setLastSavedAt,
    onSaveStart,
    onSaveComplete,
    onSaveError,
  ]);

  const queueSave = useCallback(
    (force = false) => {
      if (!noteId) return;

      const editorState = editor.getEditorState();
      const currentContent = JSON.stringify(editorState.toJSON());

      // Skip if content hasn't changed and it's not forced
      if (!force && currentContent === lastSavedContentRef.current) {
        return;
      }

      const textContent = editorState.read(() => $getRoot().getTextContent());

      // Add new save operation to queue
      const newOperation: SaveOperation = {
        content: currentContent,
        textContent,
        timestamp: Date.now(),
        attempt: 0,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      // Manage queue size by removing older operations if needed
      if (saveQueueRef.current.length >= MAX_QUEUE_SIZE) {
        saveQueueRef.current = saveQueueRef.current.slice(-MAX_QUEUE_SIZE + 1);
      }

      saveQueueRef.current.push(newOperation);

      // Trigger queue processing
      processSaveQueue();
    },
    [noteId, editor, processSaveQueue]
  );

  // Register update listener
  useEffect(() => {
    const removeUpdateListener = editor.registerUpdateListener(() => {
      if (!isDirtyRef.current && !isUnmountingRef.current) {
        isDirtyRef.current = true;
        setHasUnsavedChanges(true);
      }

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        if (!isUnmountingRef.current) {
          queueSave();
        }
      }, SAVE_DEBOUNCE);
    });

    return () => {
      removeUpdateListener();
      cleanupTimeouts();
    };
  }, [editor, queueSave, setHasUnsavedChanges, cleanupTimeouts]);

  // Handle unmount save
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;
      cleanupTimeouts();
      if (isDirtyRef.current) {
        queueSave(true);
      }
    };
  }, [queueSave, cleanupTimeouts]);

  return null;
}
