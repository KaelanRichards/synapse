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
export interface BaseState {
  content: string;
  selection: Selection | null;
  plugins: Map<string, Plugin>;
  decorations: Map<string, Decoration>;
  commands: Map<string, Command>;
  cleanupFunctions: Map<string, () => void>;
  undoStack: UndoStackItem[];
  redoStack: UndoStackItem[];
  lastUndoTime: number;
  stats: {
    wordCount: number;
    charCount: number;
    timeSpent: number;
    linesCount: number;
    readingTime: number;
  };
  saveStatus: 'saved' | 'saving' | 'unsaved';
  showToolbar: boolean;
  toolbarPosition: { x: number; y: number };
  activeFormats: Set<FormatType>;
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
  formatText: (params: {
    type: FormatType;
    prefix: string;
    suffix: string;
    selection: Selection;
  }) => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleCode: () => void;
  createLink: (url: string) => void;
}

export type FormatSlice = FormatState & FormatActions;

// Editor UI slice (editor-specific UI state)
export type UIState = WritableDraft<{
  showToolbar: boolean;
  toolbarPosition: { x: number; y: number };
}>;

export interface UIActions {
  setToolbarPosition: (position: { x: number; y: number }) => void;
  setShowToolbar: (show: boolean) => void;
}

export type UISlice = UIState & UIActions;

// Plugin slice
export type PluginState = WritableDraft<{
  plugins: Map<string, Plugin>;
  commands: Map<string, Command>;
  decorations: Map<string, Decoration>;
  cleanupFunctions: Map<string, () => void>;
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
  updatePluginState: <T extends Record<string, unknown>>(
    pluginId: string,
    state: T
  ) => void;
  getPluginState: <T extends Record<string, unknown>>(
    pluginId: string
  ) => T | undefined;

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
  setContent: (content: string) => void;
  setSelection: (selection: Selection | null) => void;
  format: (type: FormatType, selection: Selection) => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleCode: () => void;
  createLink: (url: string) => void;
  setToolbarPosition: (position: { x: number; y: number }) => void;
  setShowToolbar: (show: boolean) => void;
  registerPlugin: (plugin: Plugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  registerCommand: (command: Command) => void;
  unregisterCommand: (commandId: string) => void;
  registerDecoration: (decoration: Decoration) => void;
  unregisterDecoration: (decorationId: string) => void;
  undo: () => void;
  redo: () => void;
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
