import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import type {
  EditorState,
  Plugin,
  Decoration,
  Command,
} from '../components/editor/types';
import { createContentSlice, ContentSlice } from './slices/contentSlice';
import { createFormatSlice, FormatSlice } from './slices/formatSlice';
import { createUISlice, UISlice } from './slices/uiSlice';
import { createPluginSlice, PluginSlice } from './slices/pluginSlice';
import { createHistorySlice, HistorySlice } from './slices/historySlice';

// Enable MapSet support for Immer
enableMapSet();

export interface EditorActions {
  // Core editor actions
  initialize: () => void;
  destroy: () => void;
  reset: () => void;

  // History actions
  undo: () => void;
  redo: () => void;

  // Event handlers
  handleKeyDown: (event: KeyboardEvent) => void;
  handlePaste: (event: ClipboardEvent) => void;
  handleDrop: (event: DragEvent) => void;
}

export interface BaseEditorState
  extends Omit<EditorState, 'plugins' | 'decorations' | 'commands'> {
  plugins: Map<string, Plugin>;
  decorations: Map<string, Decoration>;
  commands: Map<string, Command>;
}

export type EditorStore = BaseEditorState &
  ContentSlice &
  FormatSlice &
  UISlice &
  PluginSlice &
  HistorySlice &
  EditorActions;

const initialState: Omit<
  BaseEditorState,
  keyof (
    | ContentSlice
    | FormatSlice
    | UISlice
    | PluginSlice
    | HistorySlice
    | EditorActions
  )
> = {
  content: '',
  selection: null,
  undoStack: [],
  redoStack: [],
  lastUndoTime: 0,
  stats: {
    wordCount: 0,
    charCount: 0,
    timeSpent: 0,
    linesCount: 0,
    readingTime: 0,
  },
  saveStatus: 'saved',
  isLocalFocusMode: false,
  isParagraphFocus: false,
  isAmbientSound: false,
  showToolbar: false,
  toolbarPosition: { x: 0, y: 0 },
  focusMode: {
    enabled: false,
    hideCommands: false,
    dimSurroundings: false,
  },
  typewriterMode: {
    enabled: false,
    sound: false,
    scrollIntoView: false,
  },
  plugins: new Map(),
  decorations: new Map(),
  commands: new Map(),
};

const defaultPlugins: Plugin[] = [
  // Add your default plugins here
];

const useEditorStore = create<EditorStore>()(
  devtools(
    persist(
      immer((set, get, api) => ({
        ...initialState,
        ...createContentSlice(set, get, api),
        ...createFormatSlice(set, get, api),
        ...createUISlice(set, get, api),
        ...createPluginSlice(set, get, api),
        ...createHistorySlice(set, get, api),

        // Core editor actions
        initialize: () => {
          // Initialize default plugins
          defaultPlugins.forEach(plugin => get().registerPlugin(plugin));
        },

        destroy: () => {
          // Clean up plugins first without triggering state updates
          const currentPlugins = Array.from(get().plugins.values());
          currentPlugins.forEach(plugin => plugin.destroy?.());

          // Reset state using Immer mutation pattern
          set(state => {
            state.content = initialState.content;
            state.selection = initialState.selection;
            state.undoStack = initialState.undoStack;
            state.redoStack = initialState.redoStack;
            state.lastUndoTime = initialState.lastUndoTime;
            state.stats = { ...initialState.stats };
            state.saveStatus = initialState.saveStatus;
            state.isLocalFocusMode = initialState.isLocalFocusMode;
            state.isParagraphFocus = initialState.isParagraphFocus;
            state.isAmbientSound = initialState.isAmbientSound;
            state.showToolbar = initialState.showToolbar;
            state.toolbarPosition = { ...initialState.toolbarPosition };
            state.focusMode = { ...initialState.focusMode };
            state.typewriterMode = { ...initialState.typewriterMode };
            state.plugins = new Map();
            state.decorations = new Map();
            state.commands = new Map();
          });
        },

        reset: () => {
          get().destroy();
          get().initialize();
        },

        // Event handlers
        handleKeyDown: (event: KeyboardEvent) => {
          const { key, ctrlKey, metaKey } = event;

          // Handle keyboard shortcuts
          if (ctrlKey || metaKey) {
            switch (key.toLowerCase()) {
              case 'z':
                if (event.shiftKey) {
                  get().redo();
                } else {
                  get().undo();
                }
                event.preventDefault();
                break;

              case 'b':
                get().toggleBold();
                event.preventDefault();
                break;

              case 'i':
                get().toggleItalic();
                event.preventDefault();
                break;

              case '`':
                get().toggleCode();
                event.preventDefault();
                break;
            }
          }
        },

        handlePaste: (event: ClipboardEvent) => {
          event.preventDefault();

          const text = event.clipboardData?.getData('text/plain');
          if (!text) return;

          const { selection } = get();
          if (selection) {
            // Replace selected text
            get().deleteText(selection.start, selection.end);
          }

          get().insertText(text);
        },

        handleDrop: (event: DragEvent) => {
          event.preventDefault();

          const text = event.dataTransfer?.getData('text/plain');
          if (!text) return;

          const { selection } = get();
          if (selection) {
            // Replace selected text
            get().deleteText(selection.start, selection.end);
          }

          get().insertText(text);
        },
      })),
      {
        name: 'editor-storage',
        partialize: state => ({
          content: state.content,
        }),
      }
    )
  )
);

export default useEditorStore;
