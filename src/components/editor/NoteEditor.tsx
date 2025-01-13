import React, { useEffect, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { useNoteMutations } from '@/hooks/useNoteMutations';
import { useEditor } from '@/contexts/EditorContext';
import { useEditorState } from '@/hooks/useEditorState';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useRouter } from 'next/router';
import { EditorToolbar } from './EditorToolbar';
import { FormatToolbar } from './FormatToolbar';
import { SearchReplaceToolbar } from './SearchReplaceToolbar';
import { VirtualTextarea } from './VirtualTextarea';
import AmbientSoundPlayer from '../AmbientSoundPlayer';
import type {
  FormatType,
  Selection,
  NoteEditorProps,
  Editor,
  EditorAction,
  EditorState,
} from './types';
import { KeyboardShortcutsPanel } from './KeyboardShortcutsPanel';
import { SearchReplacePlugin } from './plugins/SearchReplacePlugin';
import { nanoid } from 'nanoid';

const SAVE_DELAY = 1000;

export const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote }) => {
  const { updateNote } = useNoteMutations();
  const { state: editorContext, setTypewriterMode } = useEditor();
  const supabase = useSupabase();
  const router = useRouter();
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const {
    state,
    textareaRef,
    handleContentChange,
    handleFormat,
    handleSelection,
    undo,
    redo,
    toggleFocusMode,
    toggleParagraphFocus,
    toggleAmbientSound,
    setSaveStatus,
  } = useEditorState({
    initialContent: initialNote?.content ?? '',
    onChange: content => handleSave(content, setSaveStatus),
    onFormat: (type: FormatType, selection: Selection) => {
      // Additional format handling if needed
    },
  });

  // Initialize plugins
  useEffect(() => {
    const searchReplacePlugin = new SearchReplacePlugin();
    const editorInstance: Editor = {
      id: nanoid(),
      plugins: [],
      commands: new Map(),
      decorations: new Map(),
      state,
      dispatch: (action: EditorAction) => {
        if (action.type === 'UPDATE_PLUGIN_STATE') {
          const newState: EditorState = {
            ...state,
            plugins: {
              ...state.plugins,
              [action.payload.pluginId]: action.payload.state,
            },
          };
          // Update the editor state directly since we can't use setState
          Object.assign(state, newState);
        }
      },
      subscribe: () => () => {},
      registerPlugin: () => {},
      unregisterPlugin: () => {},
      registerCommand: () => {},
      executeCommand: () => {},
      addDecoration: () => {},
      removeDecoration: () => {},
    };

    const cleanup = searchReplacePlugin.init(editorInstance);

    return () => {
      if (cleanup) cleanup();
    };
  }, [state]);

  const handleSave = useCallback(
    (
      content: string,
      setSaveStatus: (status: 'saved' | 'saving' | 'unsaved') => void
    ) => {
      if (!initialNote?.id) return;

      if (content === initialNote.content) return;

      setSaveStatus('saving');
      const timeoutId = setTimeout(() => {
        updateNote.mutate(
          { id: initialNote.id, content },
          {
            onSuccess: () => setSaveStatus('saved'),
            onError: () => setSaveStatus('unsaved'),
          }
        );
      }, SAVE_DELAY);

      return () => clearTimeout(timeoutId);
    },
    [initialNote, updateNote]
  );

  // Get search-replace plugin state
  const searchReplaceState = state.plugins?.['search-replace'] || {
    isOpen: false,
    searchTerm: '',
    replaceTerm: '',
    matches: [],
    currentMatch: 0,
    caseSensitive: false,
    useRegex: false,
  };

  // Get autosave plugin state
  const autosaveState = state.plugins?.['autosave'] || {
    saveStatus: 'saved' as const,
    lastSavedContent: '',
    lastSaveTime: Date.now(),
  };

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin');
      }
    };
    checkAuth();
  }, [router, supabase]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            undo();
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'f':
            e.preventDefault();
            toggleFocusMode();
            break;
          case 'p':
            e.preventDefault();
            toggleParagraphFocus();
            break;
        }
      } else if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [undo, redo, toggleFocusMode, toggleParagraphFocus]);

  return (
    <div
      className={cn(
        'relative w-full h-full min-h-screen',
        state.isLocalFocusMode && 'bg-neutral-50 dark:bg-neutral-900',
        state.isParagraphFocus && 'prose-lg'
      )}
    >
      <EditorToolbar
        saveStatus={state.saveStatus}
        stats={state.stats}
        isLocalFocusMode={state.isLocalFocusMode}
        isAmbientSound={state.isAmbientSound}
        isTypewriterMode={editorContext.typewriterMode.enabled}
        autosaveState={autosaveState}
        onToggleFocusMode={toggleFocusMode}
        onToggleAmbientSound={toggleAmbientSound}
        onToggleTypewriterMode={() =>
          setTypewriterMode({
            enabled: !editorContext.typewriterMode.enabled,
          })
        }
      />

      <VirtualTextarea
        content={state.content}
        onChange={handleContentChange}
        onSelect={handleSelection}
        textareaRef={textareaRef}
        isLocalFocusMode={state.isLocalFocusMode}
        isParagraphFocus={state.isParagraphFocus}
      />

      {state.isAmbientSound && (
        <AmbientSoundPlayer
          isPlaying={state.isAmbientSound}
          onClose={toggleAmbientSound}
        />
      )}

      {state.showToolbar && (
        <FormatToolbar
          position={state.toolbarPosition}
          onFormat={handleFormat}
        />
      )}

      <SearchReplaceToolbar
        isOpen={searchReplaceState.isOpen}
        searchTerm={searchReplaceState.searchTerm}
        replaceTerm={searchReplaceState.replaceTerm}
        matchCount={searchReplaceState.matches.length}
        currentMatch={searchReplaceState.currentMatch}
        caseSensitive={searchReplaceState.caseSensitive}
        useRegex={searchReplaceState.useRegex}
        onClose={() => textareaRef.current?.focus()}
        onSearchChange={value => {
          textareaRef.current?.dispatchEvent(
            new CustomEvent('search', { detail: { searchTerm: value } })
          );
        }}
        onReplaceChange={value => {
          textareaRef.current?.dispatchEvent(
            new CustomEvent('replace', { detail: { replaceTerm: value } })
          );
        }}
        onFindNext={() => {
          textareaRef.current?.dispatchEvent(new CustomEvent('findNext'));
        }}
        onFindPrevious={() => {
          textareaRef.current?.dispatchEvent(new CustomEvent('findPrevious'));
        }}
        onReplace={() => {
          textareaRef.current?.dispatchEvent(new CustomEvent('replace'));
        }}
        onReplaceAll={() => {
          textareaRef.current?.dispatchEvent(new CustomEvent('replaceAll'));
        }}
        onToggleCaseSensitive={() => {
          textareaRef.current?.dispatchEvent(
            new CustomEvent('toggleCaseSensitive')
          );
        }}
        onToggleRegex={() => {
          textareaRef.current?.dispatchEvent(new CustomEvent('toggleRegex'));
        }}
      />

      <KeyboardShortcutsPanel
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
        commands={[
          {
            id: 'undo',
            name: 'Undo',
            shortcut: '⌘Z',
            category: 'History',
            execute: () => undo(),
          },
          {
            id: 'redo',
            name: 'Redo',
            shortcut: '⌘Y',
            category: 'History',
            execute: () => redo(),
          },
          {
            id: 'focus-mode',
            name: 'Toggle Focus Mode',
            shortcut: '⌘F',
            category: 'View',
            execute: () => toggleFocusMode(),
          },
          {
            id: 'paragraph-focus',
            name: 'Toggle Paragraph Focus',
            shortcut: '⌘P',
            category: 'View',
            execute: () => toggleParagraphFocus(),
          },
          {
            id: 'search',
            name: 'Search',
            shortcut: '⌘F',
            category: 'Search',
            execute: () =>
              textareaRef.current?.dispatchEvent(
                new CustomEvent('toggleSearch')
              ),
          },
          {
            id: 'find-next',
            name: 'Find Next',
            shortcut: '⌘G',
            category: 'Search',
            execute: () =>
              textareaRef.current?.dispatchEvent(new CustomEvent('findNext')),
          },
          {
            id: 'find-previous',
            name: 'Find Previous',
            shortcut: '⇧⌘G',
            category: 'Search',
            execute: () =>
              textareaRef.current?.dispatchEvent(
                new CustomEvent('findPrevious')
              ),
          },
          {
            id: 'replace',
            name: 'Replace',
            shortcut: '⌘H',
            category: 'Search',
            execute: () =>
              textareaRef.current?.dispatchEvent(new CustomEvent('replace')),
          },
          {
            id: 'replace-all',
            name: 'Replace All',
            shortcut: '⇧⌘H',
            category: 'Search',
            execute: () =>
              textareaRef.current?.dispatchEvent(new CustomEvent('replaceAll')),
          },
          {
            id: 'bold',
            name: 'Bold',
            shortcut: '⌘B',
            category: 'Format',
            execute: () => handleFormat('bold'),
          },
          {
            id: 'italic',
            name: 'Italic',
            shortcut: '⌘I',
            category: 'Format',
            execute: () => handleFormat('italic'),
          },
          {
            id: 'heading',
            name: 'Heading',
            shortcut: '⌘H',
            category: 'Format',
            execute: () => handleFormat('heading'),
          },
          {
            id: 'link',
            name: 'Link',
            shortcut: '⌘K',
            category: 'Format',
            execute: () => handleFormat('link'),
          },
          {
            id: 'code',
            name: 'Code',
            shortcut: '⌘E',
            category: 'Format',
            execute: () => handleFormat('code'),
          },
          {
            id: 'quote',
            name: 'Quote',
            shortcut: '⇧⌘.',
            category: 'Format',
            execute: () => handleFormat('quote'),
          },
          {
            id: 'keyboard-shortcuts',
            name: 'Show Keyboard Shortcuts',
            shortcut: '?',
            category: 'Help',
            execute: () => setShowKeyboardShortcuts(prev => !prev),
          },
        ]}
      />
    </div>
  );
};
