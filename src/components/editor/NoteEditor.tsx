import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNoteMutations } from '@/hooks/useNoteMutations';
import { EditorToolbar } from './EditorToolbar';
import useEditorStore from '@/store/editorStore';
import { FloatingFormatToolbar } from './FloatingFormatToolbar';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { FormattingPlugin } from './plugins/FormattingPlugin';
import { KeyboardShortcutsPlugin } from './plugins/KeyboardShortcutsPlugin';
import { debouncedPromise } from '@/lib/utils';
import { EditorState, createEditor, $getRoot } from 'lexical';
import type { EditorNote } from '@/types/notes';
import { useToast } from '@/hooks/useToast';

const SAVE_DELAY = 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const theme = {
  paragraph: 'mb-2',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
  },
};

interface SaveState {
  lastSavedContent: string;
  isSaving: boolean;
  lastSaveError: Error | null;
  pendingSave: boolean;
}

interface NoteEditorProps {
  initialNote: EditorNote;
}

const createEmptyEditorState = () => ({
  root: {
    children: [
      {
        children: [{ text: '', type: 'text' }],
        type: 'paragraph',
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
});

export const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote }) => {
  const { updateNote } = useNoteMutations();
  const { setEditor, setEditorFocused } = useEditorStore();
  const { toast } = useToast();
  const [saveState, setSaveState] = useState<SaveState>({
    lastSavedContent: '',
    isSaving: false,
    lastSaveError: null,
    pendingSave: false,
  });

  // Create a stable debounced save function
  const debouncedSaveRef = useRef(
    debouncedPromise(
      async (editorState: EditorState) => {
        if (!initialNote?.id) return;

        setSaveState(prev => ({ ...prev, isSaving: true }));
        try {
          const editorStateJSON = editorState.toJSON();
          const plainText = editorState.read(() =>
            $getRoot().getTextContent().trim()
          );

          await updateNote.mutateAsync({
            id: initialNote.id,
            content: {
              editorState: editorStateJSON,
              text: plainText,
            },
            is_pinned: initialNote.is_pinned,
            display_order: initialNote.display_order,
          });

          setSaveState(prev => ({
            ...prev,
            lastSavedContent: plainText,
            isSaving: false,
            lastSaveError: null,
            pendingSave: false,
          }));
        } catch (error) {
          setSaveState(prev => ({
            ...prev,
            isSaving: false,
            lastSaveError: error as Error,
          }));
          throw error;
        }
      },
      SAVE_DELAY,
      {
        maxRetries: MAX_RETRIES,
        retryDelay: RETRY_DELAY,
        onError: (error, attempt) => {
          if (attempt === MAX_RETRIES) {
            toast({
              title: 'Failed to save note',
              description: 'Please check your connection and try again.',
              variant: 'destructive',
            });
            console.error('Failed to save note after retries:', error);
          }
        },
      }
    )
  );

  const handleChange = useCallback(
    (editorState: EditorState) => {
      const plainText = editorState.read(() =>
        $getRoot().getTextContent().trim()
      );

      // Only save if content has changed
      if (plainText !== saveState.lastSavedContent) {
        setSaveState(prev => ({ ...prev, pendingSave: true }));
        debouncedSaveRef.current(editorState).catch(() => {
          // Error handling is done in the debounced function
        });
      }
    },
    [saveState.lastSavedContent]
  );

  // Save on unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      if (saveState.pendingSave) {
        const editor = useEditorStore.getState().editor;
        if (!editor) return;

        // Cancel any pending debounced saves
        debouncedSaveRef.current.cancel();

        // Flush the save immediately
        debouncedSaveRef.current.flush().catch(error => {
          console.error('Failed to save on unmount:', error);
          toast({
            title: 'Failed to save changes',
            description: 'Some changes may have been lost.',
            variant: 'destructive',
          });
        });
      }
    };
  }, [saveState.pendingSave, toast]);

  const initialConfig = {
    namespace: 'SynapseEditor',
    theme,
    onError: (error: Error) => {
      console.error('Editor error:', error);
      toast({
        title: 'Editor Error',
        description: 'An error occurred in the editor.',
        variant: 'destructive',
      });
    },
    editorState: initialNote?.content
      ? (editor: any) => {
          try {
            const content = initialNote.content;
            if (!content) {
              editor.setEditorState(
                editor.parseEditorState(createEmptyEditorState())
              );
              return;
            }

            if (content.editorState) {
              editor.setEditorState(
                editor.parseEditorState(content.editorState)
              );
            } else {
              editor.setEditorState(
                editor.parseEditorState(createEmptyEditorState())
              );
            }
          } catch (error) {
            console.error('Failed to initialize editor state:', error);
            editor.setEditorState(
              editor.parseEditorState(createEmptyEditorState())
            );
          }
        }
      : undefined,
  };

  // Set initial saved content after editor initialization
  useEffect(() => {
    if (initialNote?.content?.text) {
      setSaveState(prev => ({
        ...prev,
        lastSavedContent: initialNote?.content?.text || '',
      }));
    }
  }, [initialNote?.content?.text]);

  return (
    <LexicalComposer key={initialNote?.id} initialConfig={initialConfig}>
      <div className="relative w-full h-full flex flex-col">
        <EditorToolbar />
        <div className="flex-1 relative overflow-auto">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="min-h-full p-4 focus:outline-none"
                onFocus={() => setEditorFocused(true)}
                onBlur={() => setEditorFocused(false)}
              />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                Start writing...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={handleChange} />
          <HistoryPlugin />
          <FormattingPlugin />
          <KeyboardShortcutsPlugin />
          <FloatingFormatToolbar />
        </div>
      </div>
    </LexicalComposer>
  );
};
