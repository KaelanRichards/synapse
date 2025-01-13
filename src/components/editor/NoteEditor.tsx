import React, {
  useEffect,
  useLayoutEffect,
  useCallback,
  useState,
  useRef,
  useMemo,
} from 'react';
import { cn } from '@/lib/utils';
import { useNoteMutations } from '@/hooks/useNoteMutations';
import { useEditor } from '@/contexts/EditorContext';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useRouter } from 'next/router';
import { EditorToolbar } from './EditorToolbar';
import { SearchReplaceToolbar } from './SearchReplaceToolbar';
import { VirtualTextarea } from './VirtualTextarea';
import AmbientSoundPlayer from '../AmbientSoundPlayer';
import { EditorCore } from './EditorCore';
import type {
  FormatType,
  Selection,
  NoteEditorProps,
  EditorState,
} from './types';
import { KeyboardShortcutsPanel } from './KeyboardShortcutsPanel';
import { SearchReplacePlugin } from './plugins/SearchReplacePlugin';
import { AutosavePlugin } from './plugins/AutosavePlugin';
import { FormatPlugin } from '@/components/editor/plugins/FormatPlugin';

const SAVE_DELAY = 1000;

export const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote }) => {
  const editorCoreRef = useRef<EditorCore>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateNote } = useNoteMutations();
  const { state: editorContext, setTypewriterMode } = useEditor();
  const supabase = useSupabase();
  const router = useRouter();
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const initialEditorState = useMemo<EditorState>(
    () => ({
      content: initialNote?.content ?? '',
      selection: null,
      undoStack: [],
      redoStack: [],
      lastUndoTime: Date.now(),
      stats: {
        wordCount: 0,
        charCount: 0,
        timeSpent: 0,
        linesCount: 0,
        readingTime: 0,
      },
      saveStatus: 'saved' as const,
      isLocalFocusMode: false,
      isParagraphFocus: false,
      isAmbientSound: false,
      showToolbar: false,
      toolbarPosition: { x: 0, y: 0 },
      plugins: {},
      decorations: [],
      commands: [],
    }),
    [initialNote?.content]
  );

  const [editorState, setEditorState] =
    useState<EditorState>(initialEditorState);

  // Memoize the save callback to prevent unnecessary plugin re-initialization
  const handleSave = useCallback(
    async (content: string) => {
      if (!initialNote?.id) return;
      await updateNote.mutateAsync({ id: initialNote.id, content });
    },
    [initialNote?.id, updateNote]
  );

  // Initialize EditorCore
  useLayoutEffect(() => {
    if (!editorCoreRef.current) {
      editorCoreRef.current = new EditorCore(initialEditorState);
    }

    // Clean up existing plugins first
    editorCoreRef.current.plugins.forEach(plugin => {
      editorCoreRef.current?.unregisterPlugin(plugin.id);
    });

    // Initialize plugins
    const searchReplacePlugin = new SearchReplacePlugin();
    const autosavePlugin = new AutosavePlugin({
      onSave: handleSave,
      delay: SAVE_DELAY,
    });
    const formatPlugin = new FormatPlugin();

    // Register plugins
    editorCoreRef.current.registerPlugin(searchReplacePlugin);
    editorCoreRef.current.registerPlugin(autosavePlugin);
    editorCoreRef.current.registerPlugin(formatPlugin);

    // Subscribe to state changes with optimized updates
    const unsubscribe = editorCoreRef.current.subscribe(newState => {
      setEditorState(prevState => {
        // Fast path: if references are equal, no update needed
        if (prevState === newState) return prevState;

        // Only compare relevant fields that should trigger a re-render
        const hasRelevantChanges =
          prevState.content !== newState.content ||
          prevState.saveStatus !== newState.saveStatus ||
          prevState.isLocalFocusMode !== newState.isLocalFocusMode ||
          prevState.isParagraphFocus !== newState.isParagraphFocus ||
          prevState.isAmbientSound !== newState.isAmbientSound ||
          prevState.showToolbar !== newState.showToolbar ||
          JSON.stringify(prevState.selection) !==
            JSON.stringify(newState.selection) ||
          JSON.stringify(prevState.toolbarPosition) !==
            JSON.stringify(newState.toolbarPosition) ||
          JSON.stringify(prevState.stats) !== JSON.stringify(newState.stats) ||
          JSON.stringify(prevState.plugins?.['search-replace']) !==
            JSON.stringify(newState.plugins?.['search-replace']) ||
          JSON.stringify(prevState.plugins?.['autosave']) !==
            JSON.stringify(newState.plugins?.['autosave']);

        return hasRelevantChanges ? newState : prevState;
      });
    });

    return () => {
      unsubscribe();
      editorCoreRef.current?.plugins.forEach(plugin => {
        if (plugin.destroy) plugin.destroy();
      });
      editorCoreRef.current = undefined;
    };
  }, [initialEditorState, handleSave]);

  // Memoize content change handler with debounced stats update
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      editorCoreRef.current?.dispatch({
        type: 'SET_CONTENT',
        payload: newContent,
      });

      // Debounce stats update to prevent unnecessary re-renders during typing
      const timeoutId = setTimeout(() => {
        const content = editorCoreRef.current?.state.content ?? '';
        const words = content.trim().split(/\s+/).filter(Boolean).length;
        const lines = content.split('\n').length;
        const readingTime = Math.ceil(words / 200);

        editorCoreRef.current?.dispatch({
          type: 'UPDATE_STATS',
          payload: {
            wordCount: words,
            charCount: content.length,
            linesCount: lines,
            readingTime,
            timeSpent: editorCoreRef.current?.state.stats.timeSpent ?? 0,
          },
        });
      }, 500);

      return () => clearTimeout(timeoutId);
    },
    []
  );

  const handleSelection = useCallback((selection: Selection) => {
    editorCoreRef.current?.dispatch({
      type: 'SET_SELECTION',
      payload: selection,
    });
  }, []);

  const handleFormat = useCallback(
    (type: FormatType) => {
      if (!editorCoreRef.current || !editorState.selection) return;
      editorCoreRef.current.dispatch({
        type: 'FORMAT',
        payload: {
          type,
          selection: editorState.selection,
        },
      });
    },
    [editorState.selection]
  );

  // Memoize toggle handlers
  const toggleFocusMode = useCallback(() => {
    editorCoreRef.current?.dispatch({ type: 'TOGGLE_FOCUS_MODE' });
  }, []);

  const toggleParagraphFocus = useCallback(() => {
    editorCoreRef.current?.dispatch({ type: 'TOGGLE_PARAGRAPH_FOCUS' });
  }, []);

  const toggleAmbientSound = useCallback(() => {
    editorCoreRef.current?.dispatch({ type: 'TOGGLE_AMBIENT_SOUND' });
  }, []);

  // Memoize keyboard handler
  const handleKeyboard = useCallback(
    (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      // Handle combined shortcuts first
      if (cmdKey && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case '.':
            e.preventDefault();
            editorCoreRef.current?.executeCommand('format-quote');
            break;
          case 'l':
            e.preventDefault();
            editorCoreRef.current?.executeCommand('format-list');
            break;
        }
        return;
      }

      // Handle single modifier shortcuts
      if (cmdKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            editorCoreRef.current?.executeCommand('format-bold');
            break;
          case 'i':
            e.preventDefault();
            editorCoreRef.current?.executeCommand('format-italic');
            break;
          case 'h':
            e.preventDefault();
            editorCoreRef.current?.executeCommand('format-heading');
            break;
          case 'k':
            e.preventDefault();
            editorCoreRef.current?.executeCommand('format-link');
            break;
          case 'e':
            e.preventDefault();
            editorCoreRef.current?.executeCommand('format-code');
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              editorCoreRef.current?.dispatch({ type: 'REDO' });
            } else {
              editorCoreRef.current?.dispatch({ type: 'UNDO' });
            }
            break;
          case 'f':
            e.preventDefault();
            toggleFocusMode();
            break;
          case 'p':
            e.preventDefault();
            toggleParagraphFocus();
            break;
          case 's':
            e.preventDefault();
            toggleAmbientSound();
            break;
        }
        return;
      }

      // Handle non-modifier shortcuts
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(prev => !prev);
      }
    },
    [toggleFocusMode, toggleParagraphFocus, toggleAmbientSound]
  );

  // Keyboard shortcuts
  useEffect(() => {
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleKeyboard]);

  // Memoize toolbar props to prevent unnecessary re-renders
  const toolbarProps = useMemo(
    () => ({
      saveStatus: editorState.saveStatus,
      stats: editorState.stats,
      isLocalFocusMode: editorState.isLocalFocusMode,
      isAmbientSound: editorState.isAmbientSound,
      isTypewriterMode: editorContext.typewriterMode.enabled,
      autosaveState: editorState.plugins?.['autosave'],
      showFormatting: editorState.showToolbar,
      formatPosition: editorState.toolbarPosition,
    }),
    [
      editorState.saveStatus,
      editorState.stats,
      editorState.isLocalFocusMode,
      editorState.isAmbientSound,
      editorState.showToolbar,
      editorState.toolbarPosition,
      editorState.plugins?.['autosave'],
      editorContext.typewriterMode.enabled,
    ]
  );

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

  return (
    <div
      className={cn(
        'relative w-full h-full min-h-screen',
        editorState.isLocalFocusMode && 'bg-neutral-50 dark:bg-neutral-900',
        editorState.isParagraphFocus && 'prose-lg'
      )}
    >
      <EditorToolbar
        {...toolbarProps}
        onFormat={handleFormat}
        onToggleFocusMode={toggleFocusMode}
        onToggleAmbientSound={toggleAmbientSound}
        onToggleTypewriterMode={() =>
          setTypewriterMode({
            enabled: !editorContext.typewriterMode.enabled,
          })
        }
      />

      <VirtualTextarea
        content={editorState.content}
        onChange={handleContentChange}
        onSelect={handleSelection}
        textareaRef={textareaRef}
        isLocalFocusMode={editorState.isLocalFocusMode}
        isParagraphFocus={editorState.isParagraphFocus}
      />

      {editorState.isAmbientSound && (
        <AmbientSoundPlayer
          isPlaying={editorState.isAmbientSound}
          onClose={toggleAmbientSound}
        />
      )}

      <SearchReplaceToolbar
        isOpen={editorState.plugins?.['search-replace']?.isOpen ?? false}
        searchTerm={editorState.plugins?.['search-replace']?.searchTerm ?? ''}
        replaceTerm={editorState.plugins?.['search-replace']?.replaceTerm ?? ''}
        matchCount={
          editorState.plugins?.['search-replace']?.matches?.length ?? 0
        }
        currentMatch={
          editorState.plugins?.['search-replace']?.currentMatch ?? 0
        }
        caseSensitive={
          editorState.plugins?.['search-replace']?.caseSensitive ?? false
        }
        useRegex={editorState.plugins?.['search-replace']?.useRegex ?? false}
        onClose={() => textareaRef.current?.focus()}
        onSearchChange={value => {
          editorCoreRef.current?.dispatch({
            type: 'UPDATE_PLUGIN_STATE',
            payload: {
              pluginId: 'search-replace',
              state: { searchTerm: value },
            },
          });
        }}
        onReplaceChange={value => {
          editorCoreRef.current?.dispatch({
            type: 'UPDATE_PLUGIN_STATE',
            payload: {
              pluginId: 'search-replace',
              state: { replaceTerm: value },
            },
          });
        }}
        onFindNext={() => {
          editorCoreRef.current?.executeCommand('findNext');
        }}
        onFindPrevious={() => {
          editorCoreRef.current?.executeCommand('findPrevious');
        }}
        onReplace={() => {
          editorCoreRef.current?.executeCommand('replace');
        }}
        onReplaceAll={() => {
          editorCoreRef.current?.executeCommand('replaceAll');
        }}
        onToggleCaseSensitive={() => {
          editorCoreRef.current?.executeCommand('toggleCaseSensitive');
        }}
        onToggleRegex={() => {
          editorCoreRef.current?.executeCommand('toggleRegex');
        }}
      />

      <KeyboardShortcutsPanel
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
        commands={Array.from(editorCoreRef.current?.commands.values() ?? [])}
      />
    </div>
  );
};
