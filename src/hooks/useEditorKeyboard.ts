import { useEffect, useCallback } from 'react';
import useEditorStore from '@/store/editorStore';

export function useEditorKeyboard() {
  const { executeCommand } = useEditorStore();

  const handleKeyboard = useCallback(
    (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      // Handle combined shortcuts first
      if (cmdKey && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case '.':
            e.preventDefault();
            executeCommand('format-quote');
            break;
          case 'l':
            e.preventDefault();
            executeCommand('format-list');
            break;
        }
        return;
      }

      // Handle single modifier shortcuts
      if (cmdKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            executeCommand('format-bold');
            break;
          case 'i':
            e.preventDefault();
            executeCommand('format-italic');
            break;
          case 'h':
            e.preventDefault();
            executeCommand('format-heading');
            break;
          case 'k':
            e.preventDefault();
            executeCommand('format-link');
            break;
          case 'e':
            e.preventDefault();
            executeCommand('format-code');
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              executeCommand('redo');
            } else {
              executeCommand('undo');
            }
            break;
        }
      }
    },
    [executeCommand]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleKeyboard]);
}
