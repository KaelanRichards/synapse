import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useNoteMutations } from '@/hooks/useNoteMutations';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useRouter } from 'next/router';
import { EditorToolbar } from './EditorToolbar';
import { SearchReplaceToolbar } from './SearchReplaceToolbar';
import { EditorContainer } from './EditorContainer';
import AmbientSoundPlayer from '../AmbientSoundPlayer';
import type {
  Selection,
  NoteEditorProps,
  SearchReplacePluginState,
} from './types';
import { KeyboardShortcutsPanel } from './KeyboardShortcutsPanel';
import { SearchReplacePlugin } from './plugins/SearchReplacePlugin';
import { AutosavePlugin } from './plugins/AutosavePlugin';
import { FormatPlugin } from '@/components/editor/plugins/FormatPlugin';
import { MarkdownPlugin } from '@/components/editor/plugins/MarkdownPlugin';
import useEditorStore from '@/store/editorStore';
import { EditorErrorBoundary, ToolbarErrorBoundary } from './ErrorBoundary';

const SAVE_DELAY = 1000;

// Initialize plugins
const defaultPlugins = [
  new SearchReplacePlugin(),
  new AutosavePlugin(),
  new FormatPlugin(),
  new MarkdownPlugin(),
];

export const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateNote } = useNoteMutations();
  const supabase = useSupabase();
  const router = useRouter();
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Get editor state and actions from Zustand store
  const {
    content,
    selection,
    stats,
    saveStatus,
    isLocalFocusMode,
    isParagraphFocus,
    isAmbientSound,
    showToolbar,
    toolbarPosition,
    typewriterMode,
    commands,
    plugins,
    setContent,
    setSelection,
    toggleFocusMode,
    toggleParagraphFocus,
    toggleAmbientSound,
    toggleTypewriterMode,
    setToolbarPosition,
    setShowToolbar,
    initialize,
    destroy,
    undo,
    redo,
    handleKeyDown,
    handlePaste,
    handleDrop,
  } = useEditorStore();

  // Get plugin states
  const searchReplaceState = plugins.get('search-replace')?.state as
    | SearchReplacePluginState
    | undefined;

  // Initialize editor with plugins
  useEffect(() => {
    initialize();
    if (initialNote?.content) {
      setContent(initialNote.content);
    }
    defaultPlugins.forEach(plugin => {
      useEditorStore.getState().registerPlugin(plugin);
    });
    return () => {
      destroy();
    };
  }, [initialize, destroy, setContent, initialNote]);

  // Handle keyboard shortcuts
  const handleKeyboardShortcuts = useCallback(
    (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey } = event;

      if (ctrlKey || metaKey) {
        switch (key.toLowerCase()) {
          case 'z':
            if (shiftKey) {
              event.preventDefault();
              redo();
            } else {
              event.preventDefault();
              undo();
            }
            break;

          case 'k':
            event.preventDefault();
            setShowKeyboardShortcuts(prev => !prev);
            break;

          case 'f':
            event.preventDefault();
            if (searchReplaceState) {
              const command = commands.get('toggle-search');
              if (command) command.execute();
            }
            break;

          case 't':
            event.preventDefault();
            toggleTypewriterMode();
            break;

          case 'p':
            event.preventDefault();
            toggleParagraphFocus();
            break;

          default:
            handleKeyDown(event);
        }
      }
    },
    [
      handleKeyDown,
      undo,
      redo,
      commands,
      searchReplaceState,
      toggleTypewriterMode,
      toggleParagraphFocus,
    ]
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
            isLocalFocusMode={isLocalFocusMode}
            isParagraphFocus={isParagraphFocus}
            isAmbientSound={isAmbientSound}
            isTypewriterMode={typewriterMode.enabled}
            onToggleFocusMode={toggleFocusMode}
            onToggleParagraphFocus={toggleParagraphFocus}
            onToggleAmbientSound={toggleAmbientSound}
            onToggleTypewriterMode={toggleTypewriterMode}
          />
        </ToolbarErrorBoundary>

        <EditorContainer
          content={content}
          showToolbar={showToolbar}
          toolbarPosition={toolbarPosition}
          commands={commands}
          isLocalFocusMode={isLocalFocusMode}
          isParagraphFocus={isParagraphFocus}
          textareaRef={textareaRef}
          onContentChange={handleContentChange}
          onSelectionChange={handleSelectionChange}
        />

        {searchReplaceState?.isOpen && (
          <SearchReplaceToolbar
            isOpen={searchReplaceState.isOpen}
            searchTerm={searchReplaceState.searchTerm}
            replaceTerm={searchReplaceState.replaceTerm}
            matchCount={searchReplaceState.matches.length}
            currentMatch={searchReplaceState.currentMatch}
            caseSensitive={searchReplaceState.caseSensitive}
            useRegex={searchReplaceState.useRegex}
            onClose={() => textareaRef.current?.focus()}
            onSearchChange={term => {
              const command = commands.get('setSearchTerm');
              if (command) command.execute(term);
            }}
            onReplaceChange={term => {
              const command = commands.get('setReplaceTerm');
              if (command) command.execute(term);
            }}
            onFindNext={() => {
              const command = commands.get('find-next');
              if (command) command.execute();
            }}
            onFindPrevious={() => {
              const command = commands.get('find-previous');
              if (command) command.execute();
            }}
            onReplace={() => {
              const command = commands.get('replace');
              if (command) command.execute();
            }}
            onReplaceAll={() => {
              const command = commands.get('replace-all');
              if (command) command.execute();
            }}
            onToggleCaseSensitive={() => {
              const command = commands.get('toggle-case-sensitive');
              if (command) command.execute();
            }}
            onToggleRegex={() => {
              const command = commands.get('toggle-regex');
              if (command) command.execute();
            }}
          />
        )}
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
