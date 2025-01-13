import { useEffect, useRef, useCallback } from 'react';
import { EditorCore } from '@/components/editor/EditorCore';
import type {
  Plugin,
  EditorState,
  EditorAction,
  Command,
  Decoration,
} from '@/components/editor/types';

interface UseEditorOptions {
  initialState?: Partial<EditorState>;
  plugins?: Plugin[];
  onChange?: (content: string) => void;
  onSave?: (content: string) => void;
}

export function useEditor({
  initialState,
  plugins = [],
  onChange,
  onSave,
}: UseEditorOptions = {}) {
  const editorRef = useRef<EditorCore | null>(null);

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = new EditorCore(initialState);
    }
    return () => {
      // Cleanup plugins on unmount
      if (editorRef.current) {
        const editor = editorRef.current;
        editor.plugins.forEach(plugin => editor.unregisterPlugin(plugin.id));
      }
    };
  }, [initialState]);

  // Register plugins
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Register new plugins
    plugins.forEach(plugin => {
      if (!editor.plugins.some(p => p.id === plugin.id)) {
        editor.registerPlugin(plugin);
      }
    });

    // Unregister removed plugins
    editor.plugins.forEach(existingPlugin => {
      if (!plugins.some(p => p.id === existingPlugin.id)) {
        editor.unregisterPlugin(existingPlugin.id);
      }
    });
  }, [plugins]);

  // Handle content changes
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !onChange) return;

    const unsubscribe = editor.subscribe(state => {
      onChange(state.content);
    });

    return unsubscribe;
  }, [onChange]);

  // Handle save
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !onSave) return;

    const handleSave = (state: EditorState) => {
      if (state.saveStatus === 'unsaved') {
        onSave(state.content);
      }
    };

    const unsubscribe = editor.subscribe(handleSave);
    return unsubscribe;
  }, [onSave]);

  const dispatch = useCallback((action: EditorAction) => {
    editorRef.current?.dispatch(action);
  }, []);

  const registerCommand = useCallback((command: Command) => {
    editorRef.current?.registerCommand(command);
  }, []);

  const executeCommand = useCallback((commandId: string) => {
    editorRef.current?.executeCommand(commandId);
  }, []);

  const addDecoration = useCallback((decoration: Decoration) => {
    editorRef.current?.addDecoration(decoration);
  }, []);

  const removeDecoration = useCallback((decorationId: string) => {
    editorRef.current?.removeDecoration(decorationId);
  }, []);

  return {
    editor: editorRef.current,
    state: editorRef.current?.state ?? initialState ?? {},
    dispatch,
    registerCommand,
    executeCommand,
    addDecoration,
    removeDecoration,
  };
}
