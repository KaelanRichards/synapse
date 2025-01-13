import type {
  Plugin,
  PluginEventBus,
  Command as ICommand,
  Decoration as IDecoration,
  EditorEventMap,
  PluginEventHandler,
} from './types/plugin';

export type { Plugin };
export type Command = ICommand;
export type Decoration = IDecoration;
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

// Decoration System Types
// export interface Decoration { ... }

// Define editor action types
export type EditorAction =
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_SELECTION'; payload: Selection | null }
  | { type: 'REGISTER_PLUGIN'; payload: Plugin }
  | { type: 'UNREGISTER_PLUGIN'; payload: string }
  | { type: 'SET_SAVE_STATUS'; payload: SaveStatus }
  | { type: 'SET_TOOLBAR_POSITION'; payload: { x: number; y: number } }
  | { type: 'SET_SHOW_TOOLBAR'; payload: boolean };

// Define base command types
export type BaseCommandArgs =
  | []
  | [string]
  | [string, string]
  | [number, number];

// Make command execution type-safe
export interface CommandMap {
  'format-bold': [];
  'format-italic': [];
  'format-code': [];
  'format-link': [url: string];
  'format-quote': [];
  'format-list': [];
  'format-heading': [];
  undo: [];
  redo: [];
}

// Editor Core Types
export interface Editor {
  id: string;
  plugins: Map<string, Plugin>;
  commands: Map<string, Command>;
  decorations: Map<string, Decoration>;
  cleanupFunctions: Map<string, () => void>;
  state: EditorState;
  dispatch: (action: EditorAction) => void;
  subscribe: (listener: () => void) => () => void;
  registerPlugin: (plugin: Plugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  registerCommand: (command: Command) => void;
  executeCommand: <K extends keyof CommandMap>(
    commandId: K,
    ...args: CommandMap[K]
  ) => void;
  addDecoration: (decoration: Decoration) => void;
  removeDecoration: (decorationId: string) => void;
  on: <K extends keyof EditorEventMap>(
    event: K,
    handler: PluginEventHandler<K>
  ) => void;
  off: <K extends keyof EditorEventMap>(
    event: K,
    handler: PluginEventHandler<K>
  ) => void;
  update: (updater: () => void) => void;
  getSelectedText: () => Selection | null;
  eventBus: PluginEventBus;
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
