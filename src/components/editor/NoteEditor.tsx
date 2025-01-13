import React, { useEffect, useCallback, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useNoteMutations } from '@/hooks/useNoteMutations';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useRouter } from 'next/router';
import { EditorToolbar } from './EditorToolbar';
import { SearchReplaceToolbar } from './SearchReplaceToolbar';
import { VirtualTextarea } from './VirtualTextarea';
import AmbientSoundPlayer from '../AmbientSoundPlayer';
import type {
  FormatType,
  Selection,
  NoteEditorProps,
  SearchReplacePluginState,
  AutosavePluginState,
} from './types';
import { KeyboardShortcutsPanel } from './KeyboardShortcutsPanel';
import { SearchReplacePlugin } from './plugins/SearchReplacePlugin';
import { AutosavePlugin } from './plugins/AutosavePlugin';
import { FormatPlugin } from '@/components/editor/plugins/FormatPlugin';
import { MarkdownPlugin } from '@/components/editor/plugins/MarkdownPlugin';
import useEditorStore from '@/store/editorStore';

const SAVE_DELAY = 1000;

// Initialize plugins
const defaultPlugins = [
  SearchReplacePlugin,
  AutosavePlugin,
  FormatPlugin,
  MarkdownPlugin,
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
    // Initialize editor
    initialize();

    // Set initial content if provided
    if (initialNote?.content) {
      setContent(initialNote.content);
    }

    // Register plugins
    defaultPlugins.forEach(plugin => {
      const instance = plugin;
      useEditorStore.getState().registerPlugin(instance);
    });

    // Cleanup
    return () => {
      destroy();
    };
  }, [initialize, destroy, setContent, initialNote]);

  // Handle keyboard shortcuts
  const handleKeyboardShortcuts = useCallback(
    (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey } = event;

      // Handle keyboard shortcuts
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
      setSelection(selection);

      if (selection && textareaRef.current) {
        const range = document.createRange();
        const textNode = textareaRef.current.firstChild;
        if (!textNode) return;

        range.setStart(textNode, selection.start);
        range.setEnd(textNode, selection.end);

        const rect = range.getBoundingClientRect();
        setToolbarPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });
        setShowToolbar(true);
      } else {
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

      // Handle typewriter mode scrolling
      if (typewriterMode.enabled && typewriterMode.scrollIntoView) {
        const textarea = e.target;
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
        const currentLine = textarea.value
          .substr(0, textarea.selectionStart)
          .split('\n').length;
        const scrollPosition = lineHeight * currentLine;
        textarea.scrollTop = scrollPosition - textarea.clientHeight / 2;
      }
    },
    [setContent, typewriterMode]
  );

  return (
    <div className="relative flex h-full flex-col">
      {/* Editor Toolbar */}
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

      {/* Search/Replace Toolbar */}
      {searchReplaceState && (
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

      {/* Floating Format Toolbar */}
      {showToolbar && (
        <div
          className="absolute z-50 transform -translate-x-1/2 floating-toolbar"
          style={{
            left: toolbarPosition.x,
            top: Math.max(toolbarPosition.y - 40, 10),
          }}
        >
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 flex space-x-2 border border-gray-200 dark:border-gray-700">
            {Array.from(commands.values())
              .filter(cmd => cmd.category === 'Format')
              .map(cmd => (
                <button
                  key={cmd.id}
                  onClick={() => cmd.execute()}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  {cmd.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="relative flex-1 overflow-auto">
        <VirtualTextarea
          content={content}
          onChange={handleContentChange}
          onSelect={handleSelectionChange}
          textareaRef={textareaRef}
          isLocalFocusMode={isLocalFocusMode}
          isParagraphFocus={isParagraphFocus}
        />
      </div>

      {/* Ambient Sound Player */}
      {isAmbientSound && (
        <AmbientSoundPlayer
          isPlaying={isAmbientSound}
          onClose={toggleAmbientSound}
        />
      )}

      {/* Keyboard Shortcuts Panel */}
      {showKeyboardShortcuts && (
        <KeyboardShortcutsPanel
          isOpen={showKeyboardShortcuts}
          commands={Array.from(commands.values())}
          onClose={() => setShowKeyboardShortcuts(false)}
        />
      )}
    </div>
  );
};
