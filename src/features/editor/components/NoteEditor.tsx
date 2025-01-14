import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import type { LexicalEditor } from 'lexical';
import { $getRoot } from 'lexical';
import { useEditorStore } from '../store/editorStore';
import { useNote } from '@/features/notes/hooks/useNote';
import { AutosavePlugin } from '../plugins/autosave';
import { EditorNodes } from '../config/nodes';
import { EditorTheme } from '../config/theme';
import { EditorInitializationPlugin } from '../plugins/initialization';

interface NoteEditorProps {
  noteId?: string;
}

const emptyEditorState = JSON.stringify({
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
});

const createInitialConfig = (content?: any) => ({
  namespace: 'SynapseEditor',
  theme: EditorTheme,
  nodes: EditorNodes,
  onError: (error: Error) => {
    console.error('Editor Error:', error);
  },
});

export function NoteEditor({ noteId }: NoteEditorProps) {
  const router = useRouter();
  const { note } = useNote(noteId);
  const [title, setTitle] = useState(note?.title || '');
  const { editor, setEditor, hasUnsavedChanges } = useEditorStore();
  const [isEditorReady, setIsEditorReady] = useState(false);

  const handleEditorInitialized = useCallback(
    (editor: LexicalEditor) => {
      setEditor(editor);
      // Set initial state after editor is initialized
      if (note?.content?.editorState?.content) {
        try {
          const content =
            typeof note.content.editorState.content === 'string'
              ? JSON.parse(note.content.editorState.content)
              : note.content.editorState.content;

          const state = editor.parseEditorState(content);
          editor.setEditorState(state);
        } catch (error) {
          console.error('Failed to parse initial state:', error);
          const state = editor.parseEditorState(emptyEditorState);
          editor.setEditorState(state);
        }
      } else {
        const state = editor.parseEditorState(emptyEditorState);
        editor.setEditorState(state);
      }
      setIsEditorReady(true);
    },
    [setEditor, note?.content?.editorState?.content]
  );

  useEffect(() => {
    if (note?.title) {
      setTitle(note.title);
    }
  }, [note?.title]);

  // Reset editor state when note changes
  useEffect(() => {
    setEditor(null as any);
    setIsEditorReady(false);
  }, [noteId, setEditor]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // Handle navigation warnings
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <div className="relative w-full h-full">
      <div className="flex flex-col gap-4 p-4">
        <input
          type="text"
          placeholder="Untitled"
          value={title}
          onChange={handleTitleChange}
          className="text-xl font-semibold bg-transparent border-none focus:ring-0"
        />

        <LexicalComposer key={noteId} initialConfig={createInitialConfig()}>
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

            <HistoryPlugin />
            <AutoFocusPlugin />
            <ListPlugin />
            <LinkPlugin />
            <TabIndentationPlugin />
            <MarkdownShortcutPlugin />
            <TablePlugin />
            <HorizontalRulePlugin />
            <EditorInitializationPlugin onInit={handleEditorInitialized} />

            {noteId && (
              <AutosavePlugin
                noteId={noteId}
                title={title}
                onSaveError={error => {
                  console.error('Autosave error:', error);
                }}
              />
            )}

            <OnChangePlugin
              onChange={() => {
                // Additional change handlers if needed
              }}
            />
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
}
