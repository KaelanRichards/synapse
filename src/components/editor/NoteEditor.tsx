import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useNoteMutations } from '@/hooks/useNoteMutations';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useRouter } from 'next/router';
import { EditorToolbar } from './EditorToolbar';
import { EditorContainer } from './EditorContainer';
import AmbientSoundPlayer from '../AmbientSoundPlayer';
import type { Selection, NoteEditorProps } from './types';
import { KeyboardShortcutsPanel } from './KeyboardShortcutsPanel';
import { AutosavePlugin } from './plugins/AutosavePlugin';
import { FormatPlugin } from '@/components/editor/plugins/FormatPlugin';
import { MarkdownPlugin } from './plugins/MarkdownPlugin';
import useEditorStore from '@/store/editorStore';
import { EditorErrorBoundary, ToolbarErrorBoundary } from './ErrorBoundary';

const SAVE_DELAY = 1000;

// Initialize plugins
const defaultPlugins = [
  new AutosavePlugin(),
  new FormatPlugin(),
  new MarkdownPlugin(),
];

export const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateNote } = useNoteMutations();
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Get editor state and actions from Zustand store
  const {
    content,
    commands,
    stats,
    saveStatus,
    isAmbientSound,
    showToolbar,
    toolbarPosition,
    setContent,
    setSelection,
    toggleAmbientSound,
    setToolbarPosition,
    setShowToolbar,
    initialize,
    destroy,
    undo,
    redo,
  } = useEditorStore();

  // Initialize editor with plugins
  useEffect(() => {
    if (initialNote?.content) {
      initialize();
      setContent(initialNote.content);
    }
    return () => {
      destroy();
    };
  }, [destroy, initialize, initialNote?.content, setContent]);

  // Handle keyboard shortcuts
  const handleKeyboardShortcuts = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    },
    [redo, undo]
  );

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => {
      window.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [handleKeyboardShortcuts]);

  // Handle selection changes for toolbar positioning
  const handleSelectionChange = useCallback(
    (selection: Selection | null) => {
      console.log('Selection change triggered:', { selection });
      setSelection(selection);

      if (selection && selection.text && textareaRef.current) {
        console.log('Valid selection detected');
        const textarea = textareaRef.current;
        const { selectionStart, selectionEnd } = textarea;

        // Get textarea position and dimensions
        const textareaRect = textarea.getBoundingClientRect();

        // Create a temporary div to measure text dimensions
        const measureDiv = document.createElement('div');
        measureDiv.style.position = 'absolute';
        measureDiv.style.visibility = 'hidden';
        measureDiv.style.whiteSpace = 'pre-wrap';
        measureDiv.style.width = `${textarea.clientWidth}px`;
        measureDiv.style.font = window.getComputedStyle(textarea).font;
        measureDiv.style.lineHeight =
          window.getComputedStyle(textarea).lineHeight;
        measureDiv.style.padding = window.getComputedStyle(textarea).padding;

        // Get text before selection
        const textBeforeSelection = textarea.value.substring(0, selectionStart);
        const selectedText = textarea.value.substring(
          selectionStart,
          selectionEnd
        );

        // Create span for measurement
        const measureSpan = document.createElement('span');
        measureDiv.textContent = textBeforeSelection;
        measureDiv.appendChild(measureSpan);
        measureSpan.textContent = selectedText;

        // Add to DOM temporarily
        document.body.appendChild(measureDiv);

        // Get the position of the selection
        const spanRect = measureSpan.getBoundingClientRect();
        const selectionTop =
          textareaRect.top +
          (spanRect.top - measureDiv.getBoundingClientRect().top);
        const selectionLeft =
          textareaRect.left +
          (spanRect.left - measureDiv.getBoundingClientRect().left);
        const selectionWidth = spanRect.width;

        // Cleanup
        document.body.removeChild(measureDiv);

        // Calculate toolbar position
        const x = selectionLeft + selectionWidth / 2;
        const y = selectionTop;

        console.log('Toolbar position calculated:', {
          x,
          y,
          textareaRect,
          selectionTop,
          selectionLeft,
        });
        setToolbarPosition({ x, y });
        setShowToolbar(true);
        console.log('showToolbar set to true');
      } else {
        console.log('Invalid selection, hiding toolbar');
        setShowToolbar(false);
      }
    },
    [setSelection, setToolbarPosition, setShowToolbar]
  );

  // Autosave functionality
  useEffect(() => {
    if (!initialNote?.id || !content || saveStatus === 'saving') return;

    const saveTimeout = setTimeout(async () => {
      try {
        await updateNote.mutateAsync({
          id: initialNote.id,
          content,
        });
      } catch (error) {
        console.error('Failed to save note:', error);
      }
    }, SAVE_DELAY);

    return () => {
      clearTimeout(saveTimeout);
    };
  }, [content, initialNote?.id, saveStatus, updateNote]);

  // Handle content change
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    [setContent]
  );

  const handleEditorError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Editor Error:', error, errorInfo);
    // Here you could send the error to your error reporting service
  };

  const handleToolbarError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Toolbar Error:', error, errorInfo);
    // Here you could send the error to your error reporting service
  };

  const handleEditorReset = () => {
    // Reset editor state
    setContent('');
    setSelection(null);
    // Re-initialize plugins
    destroy();
    initialize();
    defaultPlugins.forEach(plugin => {
      useEditorStore.getState().registerPlugin(plugin);
    });
  };

  if (content !== initialNote?.content) {
    setContent(initialNote?.content || '');
  }

  return (
    <EditorErrorBoundary
      onError={handleEditorError}
      onReset={handleEditorReset}
    >
      <div className="relative flex flex-col h-full">
        <ToolbarErrorBoundary onError={handleToolbarError}>
          <EditorToolbar
            stats={stats}
            saveStatus={saveStatus}
            isAmbientSound={isAmbientSound}
            onToggleAmbientSound={toggleAmbientSound}
          />
        </ToolbarErrorBoundary>

        <EditorContainer
          content={content}
          showToolbar={showToolbar}
          toolbarPosition={toolbarPosition}
          commands={commands}
          textareaRef={textareaRef}
          onContentChange={handleContentChange}
          onSelectionChange={handleSelectionChange}
        />

        {showKeyboardShortcuts && (
          <KeyboardShortcutsPanel
            isOpen={showKeyboardShortcuts}
            commands={Array.from(commands.values())}
            onClose={() => setShowKeyboardShortcuts(false)}
          />
        )}
        {isAmbientSound && (
          <AmbientSoundPlayer
            isPlaying={isAmbientSound}
            onClose={toggleAmbientSound}
          />
        )}
      </div>
    </EditorErrorBoundary>
  );
};
