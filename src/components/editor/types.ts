import type { Plugin, PluginEventBus } from './types/plugin';

export type { Plugin };
export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export interface EditorStats {
  wordCount: number;
  charCount: number;
  timeSpent: number;
  linesCount: number;
  readingTime: number;
}

export interface Selection {
  start: number;
  end: number;
  text: string;
}

export interface UndoStackItem {
  content: string;
  selection: Selection;
  timestamp: number;
}

// Command System Types
export interface Command {
  id: string;
  name: string;
  description?: string;
  shortcut?: string;
  category?: string;
  isEnabled?: () => boolean;
  execute: (...args: any[]) => void;
}

// Decoration System Types
export interface Decoration {
  id: string;
  type: 'inline' | 'block';
  range: Selection;
  attributes: Record<string, string>;
  className?: string;
}

// Editor Core Types
export interface Editor {
  id: string;
  plugins: Map<string, Plugin>;
  commands: Map<string, Command>;
  decorations: Map<string, Decoration>;
  cleanupFunctions: Map<string, () => void>;
  state: EditorState;
  dispatch: (action: any) => void;
  subscribe: (listener: () => void) => () => void;
  registerPlugin: (plugin: Plugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  registerCommand: (command: Command) => void;
  executeCommand: (commandId: string, ...args: any[]) => void;
  addDecoration: (decoration: Decoration) => void;
  removeDecoration: (decorationId: string) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler: (...args: any[]) => void) => void;
  update: (updater: () => void) => void;
  getSelectedText: () => Selection | null;
  eventBus?: PluginEventBus;
}

export type FormatType =
  | 'bold'
  | 'italic'
  | 'link'
  | 'code'
  | 'table'
  | 'image';

export interface AutosavePluginState {
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';
  lastSavedContent: string;
  lastSaveTime: number;
  errorMessage?: string;
}

export interface EditorState {
  content: string;
  selection: Selection | null;
  plugins: Map<string, Plugin>;
  commands: Map<string, Command>;
  decorations: Map<string, Decoration>;
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
  saveStatus: 'saved' | 'saving' | 'error' | 'unsaved';
  showToolbar: boolean;
  toolbarPosition: { x: number; y: number };
}

export interface EditorProps {
  initialContent?: string | null | undefined;
  plugins?: Plugin[];
  onChange?: (content: string) => void;
  onSave?: (content: string) => void;
  onFormat?: (type: FormatType, selection: Selection) => void;
  className?: string;
}

export interface NoteEditorProps {
  initialNote?: {
    id: string;
    title: string;
    content: string;
    maturity_state: 'SEED' | 'SAPLING' | 'GROWTH' | 'MATURE' | 'EVOLVING';
  };
  plugins?: Plugin[];
}
