import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { $getSelection, $isRangeSelection, $getRoot } from 'lexical';
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
import { useEditorStore } from '../store/editorStore';
import { EditorToolbar } from './EditorToolbar';
import { FloatingFormatToolbar } from './FloatingFormatToolbar';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { EditorTheme } from '@/features/editor/config/theme';
import { EditorNodes } from '@/features/editor/config/nodes';
import { useNote } from '@/features/notes/hooks/useNote';
import { useNoteMutations } from '@/features/notes/hooks/useNoteMutations';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Input } from '@/shared/components/ui/Input';

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
  const { updateNote } = useNoteMutations();
  const [title, setTitle] = useState(note?.title || '');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { editor, setEditor, setEditorFocused, setActiveFormats } =
    useEditorStore();

  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(
    editor?.getEditorState().toJSON() || '',
    1000
  );

  const saveNote = useCallback(async () => {
    if (!noteId || !editor) return;

    try {
      setIsSaving(true);
      await updateNote({
        id: noteId,
        title: debouncedTitle,
        content: {
          text: editor.getEditorState().read(() => $getRoot().getTextContent()),
          editorState: {
            type: 'lexical',
            content: editor.getEditorState().toJSON(),
          },
        },
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  }, [noteId, debouncedTitle, editor, updateNote]);

  useEffect(() => {
    if (note?.title) {
      setTitle(note.title);
    }
  }, [note?.title]);

  useEffect(() => {
    if (editor && note?.content) {
      try {
        const editorState = note.content.editorState.content;
        editor.setEditorState(editor.parseEditorState(editorState));
      } catch (error) {
        console.error('Failed to parse editor state:', error);
        const emptyState = editor.parseEditorState('');
        editor.setEditorState(emptyState);
      }
    }
  }, [editor, note?.content]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      saveNote();
    }
  }, [debouncedTitle, debouncedContent, hasUnsavedChanges, saveNote]);

  const onChange = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleRouteChange = () => {
      if (hasUnsavedChanges) {
        saveNote();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      router.events.off('routeChangeStart', handleRouteChange);

      if (hasUnsavedChanges) {
        saveNote();
      }
    };
  }, [hasUnsavedChanges, saveNote, router]);

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Note title..."
          value={title}
          onChange={e => {
            setTitle(e.target.value);
            setHasUnsavedChanges(true);
          }}
        />
        {isSaving && <span className="text-sm text-gray-500">Saving...</span>}
      </div>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative flex flex-col flex-grow">
          <EditorToolbar />
          <div className="flex-grow overflow-auto">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="min-h-[200px] outline-none" />
              }
              placeholder={
                <div className="pointer-events-none absolute top-0 left-0 p-2 text-gray-400">
                  Start writing...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          <FloatingFormatToolbar />
          <OnChangePlugin onChange={onChange} />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <LinkPlugin />
          <TabIndentationPlugin />
          <CheckListPlugin />
          <TablePlugin />
          <HorizontalRulePlugin />
          <MarkdownShortcutPlugin />
        </div>
      </LexicalComposer>
    </div>
  );
}
