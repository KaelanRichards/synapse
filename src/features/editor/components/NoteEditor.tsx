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
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { LexicalEditor } from 'lexical';
import { useEditorStore } from '../store/editorStore';
import { EditorToolbar } from './EditorToolbar';
import { FloatingFormatToolbar } from './FloatingFormatToolbar';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { EditorTheme } from '@/features/editor/config/theme';
import { EditorNodes } from '@/features/editor/config/nodes';
import { useNote } from '@/features/notes/hooks/useNote';
import { Input } from '@/shared/components/ui/Input';
import { useEditorSave } from '../hooks/useEditorSave';

// Create a custom initialization plugin using the proper Lexical API
function EditorInitializationPlugin({
  onInit,
}: {
  onInit: (editor: LexicalEditor) => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    onInit(editor);
  }, [editor, onInit]);

  return null;
}

interface NoteEditorProps {
  noteId?: string;
}

const initialConfig = {
  namespace: 'SynapseEditor',
  theme: EditorTheme,
  nodes: EditorNodes,
  onError: (error: Error) => {
    console.error('Editor Error:', error);
  },
};

export function NoteEditor({ noteId }: NoteEditorProps) {
  const router = useRouter();
  const { note } = useNote(noteId);
  const [title, setTitle] = useState(note?.title || '');
  const { editor, setEditor } = useEditorStore();
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const {
    isSaving,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    saveError,
    saveNote,
    onChange,
  } = useEditorSave({
    noteId: noteId || '',
    editor: isEditorReady ? editor : null,
    title,
  });

  const handleEditorInitialized = useCallback(
    (editor: LexicalEditor) => {
      console.log('Editor initialized');
      setEditor(editor);
      setIsEditorReady(true);
    },
    [setEditor]
  );

  useEffect(() => {
    if (note?.title) {
      console.log('Updating title from note:', note.title);
      setTitle(note.title);
    }
  }, [note?.title]);

  useEffect(() => {
    if (editor && note?.content && isEditorReady) {
      console.log('Loading note content into editor');
      try {
        const editorState = note.content.editorState.content;
        if (!editorState) {
          console.log('No editor state found, initializing with empty state');
          const emptyState = editor.parseEditorState(
            '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}'
          );
          editor.setEditorState(emptyState);
          return;
        }

        // Validate that the editor state is valid JSON
        let parsedState;
        try {
          if (typeof editorState === 'string') {
            parsedState = JSON.parse(editorState);
          } else {
            parsedState = editorState;
          }

          // Ensure the state has a root node
          if (!parsedState.root) {
            throw new Error('Invalid editor state: missing root node');
          }

          const state = editor.parseEditorState(parsedState);
          editor.setEditorState(state);
          console.log('Note content loaded successfully');
        } catch (parseError) {
          console.error('Failed to parse editor state:', parseError);
          const emptyState = editor.parseEditorState(
            '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}'
          );
          editor.setEditorState(emptyState);
        }
      } catch (error) {
        console.error('Failed to load note content:', error);
        const emptyState = editor.parseEditorState(
          '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}'
        );
        editor.setEditorState(emptyState);
      }
    }
  }, [editor, note?.content, isEditorReady]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    console.log('Title changed:', newTitle);
    setTitle(newTitle);
    onChange();
  };

  useEffect(() => {
    if (hasUnsavedChanges) {
      console.log('Detected unsaved changes, triggering save');
      saveNote().then(() => {
        if (!saveError) {
          const now = new Date();
          console.log(
            'Save completed, updating lastSavedAt:',
            now.toISOString()
          );
          setLastSavedAt(now);
        }
      });
    }
  }, [hasUnsavedChanges, saveNote, saveError]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        console.log('Preventing page unload due to unsaved changes');
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleRouteChange = () => {
      if (hasUnsavedChanges) {
        console.log('Route change detected with unsaved changes, saving...');
        saveNote();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      router.events.off('routeChangeStart', handleRouteChange);

      if (hasUnsavedChanges) {
        console.log('Component unmounting with unsaved changes, saving...');
        saveNote();
      }
    };
  }, [hasUnsavedChanges, saveNote, router]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Input
        type="text"
        placeholder="Untitled Note"
        value={title}
        onChange={handleTitleChange}
        className="mb-4 border-none text-2xl font-bold focus:ring-0"
      />
      <LexicalComposer
        initialConfig={{
          ...initialConfig,
          onError: (error: Error) => {
            console.error('Editor Error:', error);
          },
          editable: true,
        }}
      >
        <div className="relative flex h-full flex-col overflow-hidden rounded-lg border">
          <EditorToolbar />
          <div className="relative flex-1 overflow-auto">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="min-h-[500px] px-4 py-2 focus:outline-none" />
              }
              placeholder={
                <div className="pointer-events-none absolute left-4 top-2 select-none text-gray-400">
                  Start writing...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <FloatingFormatToolbar />
          </div>
        </div>
        <HistoryPlugin />
        <AutoFocusPlugin />
        <ListPlugin />
        <LinkPlugin />
        <TabIndentationPlugin />
        <MarkdownShortcutPlugin />
        <CheckListPlugin />
        <TablePlugin />
        <HorizontalRulePlugin />
        <OnChangePlugin onChange={onChange} />
        <EditorInitializationPlugin onInit={handleEditorInitialized} />
      </LexicalComposer>
    </div>
  );
}
