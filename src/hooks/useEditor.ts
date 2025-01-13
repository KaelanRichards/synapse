import { useEffect } from 'react';
import type { Plugin } from '@/components/editor/types';
import useEditorStore from '@/store/editorStore';

interface UseEditorOptions {
  initialContent?: string | null | undefined;
  plugins?: Plugin[];
  onChange?: (content: string) => void;
  onSave?: (content: string) => void;
}

export function useEditor({
  initialContent,
  plugins = [],
  onChange,
  onSave,
}: UseEditorOptions = {}) {
  const {
    content,
    saveStatus,
    setContent,
    registerPlugin,
    unregisterPlugin,
    initialize,
    destroy,
  } = useEditorStore();

  // Initialize editor
  useEffect(() => {
    initialize();

    // Set initial content
    if (initialContent) {
      setContent(initialContent);
    }

    // Register plugins
    plugins.forEach(plugin => {
      registerPlugin(plugin);
    });

    return () => {
      destroy();
    };
  }, []);

  // Handle content changes
  useEffect(() => {
    if (onChange) {
      onChange(content);
    }
  }, [content, onChange]);

  // Handle save
  useEffect(() => {
    if (onSave && saveStatus === 'unsaved') {
      onSave(content);
    }
  }, [content, saveStatus, onSave]);

  return useEditorStore();
}
