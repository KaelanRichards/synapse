import React, {
  useEffect,
  useCallback,
  useState,
  useRef,
  ChangeEvent,
} from 'react';
import { cn } from '@/lib/utils';
import { useNoteMutations } from '@/hooks/useNoteMutations';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useRouter } from 'next/router';
import { EditorToolbar } from './EditorToolbar';
import { SearchReplaceToolbar } from './SearchReplaceToolbar';
import { VirtualTextarea } from './VirtualTextarea';
import AmbientSoundPlayer from '../AmbientSoundPlayer';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Code as CodeIcon,
  Quote as QuoteIcon,
  List as ListIcon,
  Heading1 as Heading1Icon,
  Link as LinkIcon,
} from 'lucide-react';
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
      console.log('Selection changed:', selection);
      setSelection(selection);

      if (selection && selection.text && textareaRef.current) {
        console.log('Selection is valid, calculating position');
        const textarea = textareaRef.current;
        const { selectionStart, selectionEnd } = textarea;

        // Create a temporary div to measure text dimensions
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordWrap = 'break-word';
        div.style.width = `${textarea.clientWidth}px`;
        div.style.font = window.getComputedStyle(textarea).font;
        div.style.padding = window.getComputedStyle(textarea).padding;
        div.style.lineHeight = window.getComputedStyle(textarea).lineHeight;

        // Get text before cursor
        const textBeforeCursor = textarea.value.substring(0, selectionStart);
        const textSelection = textarea.value.substring(
          selectionStart,
          selectionEnd
        );

        // Create marker for position
        const markerSpan = document.createElement('span');
        div.textContent = textBeforeCursor;
        div.appendChild(markerSpan);
        markerSpan.textContent = textSelection;

        // Add to DOM temporarily to measure
        document.body.appendChild(div);

        // Get position relative to textarea
        const markerRect = markerSpan.getBoundingClientRect();
        const textareaRect = textarea.getBoundingClientRect();

        // Calculate position accounting for scroll
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft =
          window.pageXOffset || document.documentElement.scrollLeft;

        const x =
          textareaRect.left +
          scrollLeft +
          (markerRect.left - textareaRect.left + markerRect.width / 2);
        const y =
          textareaRect.top + scrollTop + (markerRect.top - textareaRect.top);

        console.log('Calculated position:', { x, y });

        // Cleanup
        document.body.removeChild(div);

        setToolbarPosition({
          x,
          y,
        });
        setShowToolbar(true);
        console.log('Toolbar should be visible at:', { x, y });
      } else {
        console.log('Selection is not valid, hiding toolbar');
        setShowToolbar(false);
      }
    },
    [setSelection, setToolbarPosition, setShowToolbar]
  );

  // Log commands for debugging
  useEffect(() => {
    console.log(
      'Available format commands:',
      Array.from(commands.values())
        .filter(cmd => cmd.category === 'Format')
        .map(cmd => cmd.name)
    );
  }, [commands]);

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
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    [setContent]
  );

  return (
    <div className="relative flex flex-col h-full">
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

      <div className="relative flex-1 overflow-auto">
        {/* Floating Format Toolbar */}
        {showToolbar && (
          <div
            className="fixed z-50 transform -translate-x-1/2 floating-toolbar"
            style={{
              left: toolbarPosition.x,
              top: Math.max(toolbarPosition.y - 40, 10),
              pointerEvents: 'auto',
            }}
          >
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 flex space-x-2 border border-gray-200 dark:border-gray-700 min-w-[200px]">
              <button
                onClick={() => commands.get('format-bold')?.execute()}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                title="Bold (⌘B)"
              >
                <BoldIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => commands.get('format-italic')?.execute()}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                title="Italic (⌘I)"
              >
                <ItalicIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => commands.get('format-code')?.execute()}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                title="Code (⌘E)"
              >
                <CodeIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => commands.get('format-heading')?.execute()}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                title="Heading (⌘H)"
              >
                <Heading1Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => commands.get('format-link')?.execute()}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                title="Link (⌘K)"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => commands.get('format-quote')?.execute()}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                title="Quote (⇧⌘.)"
              >
                <QuoteIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => commands.get('format-list')?.execute()}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                title="List (⌘L)"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <VirtualTextarea
          content={content}
          onChange={handleContentChange}
          onSelect={handleSelectionChange}
          textareaRef={textareaRef}
          isLocalFocusMode={isLocalFocusMode}
          isParagraphFocus={isParagraphFocus}
        />
      </div>

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
  );
};
