import React, { useCallback, useState, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { EditorTheme } from '../config/theme';
import { EditorNodes } from '../config/nodes';
import { CorePlugins } from '../plugins';
import { ToolbarPlugin } from '../plugins/toolbar';
import { AutosavePlugin } from '../plugins/autosave';
import { EditorInitializationPlugin } from '../plugins/initialization';
import { FloatingToolbarPlugin } from '../plugins/floatingToolbar';
import { Input } from '@/shared/components/ui/Input';
import { useEditorStore } from '../store/editorStore';
import { Loader } from '@/shared/components/ui/Loader';

interface EditorProps {
  noteId?: string;
  initialContent?: string;
  initialTitle?: string;
  onSaveStart?: () => void;
  onSaveComplete?: () => void;
  onSaveError?: (error: Error) => void;
}

const initialConfig = {
  namespace: 'SynapseEditor',
  theme: EditorTheme,
  nodes: EditorNodes,
  onError: (error: Error) => {
    console.error('Editor Error:', error);
  },
};

export function Editor({
  noteId,
  initialContent,
  initialTitle = '',
  onSaveStart,
  onSaveComplete,
  onSaveError,
}: EditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const {
    setEditor,
    setEditorFocused,
    isInitializing,
    isLoadingContent,
    isSaving,
    error,
    setInitializing,
    setLoadingContent,
    setError,
    reset,
  } = useEditorStore();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Handle title changes safely
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        setTitle(e.target.value);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to update title')
        );
      }
    },
    [setError]
  );

  const handleEditorInit = useCallback(
    async (editor: any) => {
      let mounted = true;
      try {
        setInitializing(true);
        setEditor(editor);

        if (initialContent && mounted) {
          setLoadingContent(true);
          const editorState = editor.parseEditorState(initialContent);
          await editor.setEditorState(editorState);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err
              : new Error('Failed to initialize editor')
          );
        }
      } finally {
        if (mounted) {
          setInitializing(false);
          setLoadingContent(false);
        }
      }

      return () => {
        mounted = false;
      };
    },
    [initialContent, setEditor, setInitializing, setLoadingContent, setError]
  );

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="relative w-full h-full">
      {(isInitializing || isLoadingContent) && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader
            size="lg"
            text={
              isInitializing ? 'Initializing editor...' : 'Loading content...'
            }
          />
        </div>
      )}

      <div className="flex flex-col gap-4 p-4">
        <Input
          type="text"
          placeholder="Untitled"
          value={title}
          onChange={handleTitleChange}
          className="text-xl font-semibold bg-transparent border-none focus:ring-0"
          disabled={isInitializing || isLoadingContent}
        />

        <LexicalComposer initialConfig={initialConfig}>
          <div className="relative prose prose-sm max-w-none">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="min-h-[500px] outline-none" />
              }
              placeholder={
                <div className="absolute top-0 text-muted-foreground">
                  Start writing...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />

            <CorePlugins />
            <ToolbarPlugin />
            <FloatingToolbarPlugin />
            <EditorInitializationPlugin onInit={handleEditorInit} />

            {noteId && (
              <AutosavePlugin
                noteId={noteId}
                title={title}
                onSaveStart={onSaveStart}
                onSaveComplete={onSaveComplete}
                onSaveError={err => {
                  setError(err);
                  onSaveError?.(err);
                }}
              />
            )}
          </div>
        </LexicalComposer>
      </div>

      {isSaving && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-md shadow-lg">
          <Loader size="sm" text="Saving..." />
        </div>
      )}
    </div>
  );
}
