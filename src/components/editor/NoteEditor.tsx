import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useNoteMutations } from '@/hooks/useNoteMutations';
import { EditorToolbar } from './EditorToolbar';
import type { Selection, NoteEditorProps, EditorStats } from './types';
import { AutosavePlugin } from './plugins/AutosavePlugin';
import { FormatPlugin } from '@/components/editor/plugins/FormatPlugin';
import useEditorStore from '@/store/editorStore';
import { EditorErrorBoundary } from './ErrorBoundary';
import { VirtualTextarea } from './VirtualTextarea';
import { FloatingFormatToolbar } from './FloatingFormatToolbar';

const SAVE_DELAY = 1000;

// Initialize plugins
const defaultPlugins = [new AutosavePlugin(), new FormatPlugin()];

export const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateNote } = useNoteMutations();
  const [content, setContent] = useState(initialNote?.content || '');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isAmbientSound, setIsAmbientSound] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [editorStats, setEditorStats] = useState<EditorStats>({
    wordCount: 0,
    charCount: 0,
    timeSpent: 0,
    linesCount: 0,
    readingTime: 0,
  });
  const [commands] = useState(new Map());

  // Get editor state and actions from Zustand store
  const {
    commands: storeCommands,
    setSelection,
    setToolbarPosition: setStoreToolbarPosition,
    showToolbar,
    setShowToolbar,
    initialize,
    destroy,
    undo,
    redo,
  } = useEditorStore();

  // Update content when initialNote changes
  useEffect(() => {
    if (content !== initialNote?.content) {
      setContent(initialNote?.content || '');
    }
  }, [initialNote?.content]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      setSaveStatus('saving');
    },
    []
  );

  const handleToggleAmbientSound = useCallback(() => {
    setIsAmbientSound(prev => !prev);
  }, []);

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [redo, undo]);

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

  return (
    <EditorErrorBoundary onReset={handleEditorReset}>
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center space-x-4">
            <EditorToolbar
              stats={editorStats}
              saveStatus={saveStatus}
              isAmbientSound={isAmbientSound}
              onToggleAmbientSound={handleToggleAmbientSound}
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-ink-muted">
              {saveStatus === 'saved' ? 'Saved' : 'Saving...'}
            </span>
          </div>
        </header>

        {/* Editor Content */}
        <div className="flex-1 overflow-auto">
          <VirtualTextarea
            textareaRef={textareaRef}
            content={content}
            onChange={handleChange}
            onSelect={handleSelectionChange}
          />
        </div>

        {/* Floating Format Toolbar */}
        {showToolbar && (
          <FloatingFormatToolbar
            position={toolbarPosition}
            commands={commands}
          />
        )}
      </div>
    </EditorErrorBoundary>
  );
};
