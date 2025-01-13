import type {
  EditorState,
  Plugin,
  Command,
  Decoration,
  Selection,
  FormatType,
  UndoStackItem,
} from '../components/editor/types';

import { WritableDraft } from 'immer';

// Base state interface that all slices will extend
export interface BaseState
  extends WritableDraft<
    Omit<EditorState, 'plugins' | 'decorations' | 'commands'>
  > {
  plugins: Map<string, Plugin>;
  decorations: Map<string, Decoration>;
  commands: Map<string, Command>;
}

// Content slice
export type ContentState = WritableDraft<{
  content: string;
  selection: Selection | null;
}>;

export interface ContentActions {
  setContent: (content: string) => void;
  setSelection: (selection: Selection | null) => void;
  insertText: (text: string, at?: number) => void;
  deleteText: (start: number, end: number) => void;
  getSelectedText: () => string | null;
}

export type ContentSlice = ContentState & ContentActions;

// Format slice
export type FormatState = WritableDraft<{
  activeFormats: Set<FormatType>;
}>;

export interface FormatActions {
  format: (type: FormatType, selection: Selection) => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleCode: () => void;
  createLink: (url: string) => void;
  createHeading: (level: 1 | 2 | 3 | 4 | 5 | 6) => void;
  createList: (ordered: boolean) => void;
  createQuote: () => void;
}

export type FormatSlice = FormatState & FormatActions;

// Editor UI slice (editor-specific UI state)
export type UIState = WritableDraft<{
  isLocalFocusMode: boolean;
  isParagraphFocus: boolean;
  isAmbientSound: boolean;
  showToolbar: boolean;
  toolbarPosition: { x: number; y: number };
  typewriterMode: {
    enabled: boolean;
    sound: boolean;
    scrollIntoView: boolean;
  };
}>;

export interface UIActions {
  toggleFocusMode: () => void;
  toggleParagraphFocus: () => void;
  toggleAmbientSound: () => void;
  toggleTypewriterMode: () => void;
  setToolbarPosition: (position: { x: number; y: number }) => void;
  setShowToolbar: (show: boolean) => void;
  setTypewriterMode: (settings: Partial<UIState['typewriterMode']>) => void;
}

export type UISlice = UIState & UIActions;

// Plugin slice
export type PluginState = WritableDraft<{
  plugins: Map<string, Plugin>;
  commands: Map<string, Command>;
  decorations: Map<string, Decoration>;
}>;

export interface PluginActions {
  registerPlugin: (plugin: Plugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  getPlugin: (pluginId: string) => Plugin | undefined;
  registerCommand: (command: Command) => void;
  unregisterCommand: (commandId: string) => void;
  executeCommand: (commandId: string, ...args: any[]) => void;
  addDecoration: (decoration: Decoration) => void;
  removeDecoration: (decorationId: string) => void;
  getDecorations: () => Decoration[];
  updatePluginState: <T>(pluginId: string, state: T) => void;
  getPluginState: <T>(pluginId: string) => T | undefined;

  // Hook runners
  runBeforeContentChange: (content: string) => string | void;
  runAfterContentChange: (content: string) => void;
  runBeforeFormat: (type: FormatType, selection: Selection) => boolean | void;
  runAfterFormat: (type: FormatType, selection: Selection) => void;
}

export type PluginSlice = PluginState & PluginActions;

// History slice
export type HistoryState = WritableDraft<{
  undoStack: UndoStackItem[];
  redoStack: UndoStackItem[];
  lastUndoTime: number;
}>;

export interface HistoryActions {
  undo: () => void;
  redo: () => void;
  addToUndoStack: (item: UndoStackItem) => void;
  clearHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getLastUndoItem: () => UndoStackItem | undefined;
  getLastRedoItem: () => UndoStackItem | undefined;
}

export type HistorySlice = HistoryState & HistoryActions;

// Core editor actions
export interface EditorActions {
  initialize: () => void;
  destroy: () => void;
  reset: () => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  handlePaste: (event: ClipboardEvent) => void;
  handleDrop: (event: DragEvent) => void;
}

// Complete editor store type
export type EditorStore = WritableDraft<
  BaseState &
    ContentSlice &
    FormatSlice &
    UISlice &
    PluginSlice &
    HistorySlice &
    EditorActions
>;
