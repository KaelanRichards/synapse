import type {
  Command,
  Selection,
  UndoStackItem,
  FormatType,
  Decoration,
  EditorAction,
  CommandMap,
  SaveStatus,
} from '@/components/editor/types';
import type { Plugin } from '@/components/editor/types/plugin';

export interface EditorStore {
  // State
  content: string;
  selection: Selection | null;
  plugins: Map<string, Plugin>;
  commands: Map<string, Command>;
  decorations: Map<string, Decoration>;
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
  saveStatus: SaveStatus;
  showToolbar: boolean;
  toolbarPosition: { x: number; y: number };
  activeFormats: Set<FormatType>;

  // Actions
  setContent: (content: string) => void;
  setSelection: (selection: Selection | null) => void;
  insertText: (text: string, at?: number) => void;
  deleteText: (start: number, end: number) => void;
  getSelectedText: () => Selection | null;
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
  setToolbarPosition: (position: { x: number; y: number }) => void;
  setShowToolbar: (show: boolean) => void;
  registerPlugin: (plugin: Plugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  getPlugin: (pluginId: string) => Plugin | undefined;
  registerCommand: (command: Command) => void;
  unregisterCommand: (commandId: string) => void;
  executeCommand: <K extends keyof CommandMap>(
    commandId: K,
    ...args: CommandMap[K]
  ) => void;
  addDecoration: (decoration: Decoration) => void;
  removeDecoration: (decorationId: string) => void;
  getDecorations: () => Decoration[];
  updatePluginState: <T>(pluginId: string, state: T) => void;
  getPluginState: <T>(pluginId: string) => T | undefined;
  runBeforeContentChange: (content: string) => string;
  runAfterContentChange: (content: string) => void;
  runBeforeFormat: (type: FormatType, selection: Selection) => boolean;
  runAfterFormat: (type: FormatType, selection: Selection) => void;
  addToUndoStack: (item: UndoStackItem) => void;
  clearHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getLastUndoItem: () => UndoStackItem | undefined;
  getLastRedoItem: () => UndoStackItem | undefined;
  initialize: () => void;
  destroy: () => void;
  reset: () => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  handlePaste: (event: ClipboardEvent) => void;
  handleDrop: (event: DragEvent) => void;
  undo: () => void;
  redo: () => void;
  dispatch: (action: EditorAction) => void;
  registerDecoration: (decoration: Decoration) => void;
  unregisterDecoration: (decorationId: string) => void;
}

export interface ContentSlice {
  content: string;
  setContent: (content: string) => void;
  insertText: (text: string, at?: number) => void;
  deleteText: (start: number, end: number) => void;
}

export interface FormatSlice {
  activeFormats: Set<FormatType>;
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

export interface UISlice {
  showToolbar: boolean;
  toolbarPosition: { x: number; y: number };
  setToolbarPosition: (position: { x: number; y: number }) => void;
  setShowToolbar: (show: boolean) => void;
}

export interface PluginSlice {
  plugins: Map<string, Plugin>;
  commands: Map<string, Command>;
  decorations: Map<string, Decoration>;
  cleanupFunctions: Map<string, () => void>;
  registerPlugin: (plugin: Plugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  getPlugin: (pluginId: string) => Plugin | undefined;
}

export interface IEditorActions {
  initialize: () => void;
  destroy: () => void;
  reset: () => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  handlePaste: (event: ClipboardEvent) => void;
  handleDrop: (event: DragEvent) => void;
  dispatch: (action: EditorAction) => void;
}
