export type SaveStatus = 'saved' | 'saving' | 'unsaved';

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

// Plugin System Types
export interface Plugin {
  id: string;
  name: string;
  init?: (editor: Editor) => void | (() => void);
  destroy?: () => void;
  commands?: Command[];
  decorations?: Decoration[];
  hooks?: {
    beforeContentChange?: (content: string) => string;
    afterContentChange?: (content: string) => void;
    beforeFormat?: (type: FormatType, selection: Selection) => boolean;
    afterFormat?: (type: FormatType, selection: Selection) => void;
  };
}

// Command System Types
export interface Command {
  id: string;
  name: string;
  description?: string;
  shortcut?: string;
  category?: string;
  isEnabled?: () => boolean;
  execute: () => void;
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
  plugins: Plugin[];
  commands: Map<string, Command>;
  decorations: Map<string, Decoration>;
  state: EditorState;
  dispatch: (action: EditorAction) => void;
  subscribe: (subscriber: (state: EditorState) => void) => () => void;
  registerPlugin: (plugin: Plugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  registerCommand: (command: Command) => void;
  executeCommand: (commandId: string) => void;
  addDecoration: (decoration: Decoration) => void;
  removeDecoration: (decorationId: string) => void;
}

export type FormatType =
  | 'bold'
  | 'italic'
  | 'heading'
  | 'link'
  | 'code'
  | 'quote'
  | 'list'
  | 'table'
  | 'image';

export interface SearchReplacePluginState {
  isOpen: boolean;
  searchTerm: string;
  replaceTerm: string;
  matches: number[];
  currentMatch: number;
  caseSensitive: boolean;
  useRegex: boolean;
}

export interface AutosavePluginState {
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';
  lastSavedContent: string;
  lastSaveTime: number;
  errorMessage?: string;
}

export interface EditorState {
  content: string;
  selection: Selection | null;
  undoStack: UndoStackItem[];
  redoStack: UndoStackItem[];
  lastUndoTime: number;
  stats: EditorStats;
  saveStatus: SaveStatus;
  isLocalFocusMode: boolean;
  isParagraphFocus: boolean;
  isAmbientSound: boolean;
  showToolbar: boolean;
  toolbarPosition: { x: number; y: number };
  plugins: {
    'search-replace'?: SearchReplacePluginState;
    autosave?: AutosavePluginState;
    [pluginId: string]: any;
  };
  decorations: Decoration[];
  commands: Command[];
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

// Editor Action Types
export type EditorAction =
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_SELECTION'; payload: Selection }
  | { type: 'ADD_TO_UNDO_STACK'; payload: UndoStackItem }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'UPDATE_STATS'; payload: EditorStats }
  | { type: 'SET_SAVE_STATUS'; payload: SaveStatus }
  | { type: 'TOGGLE_FOCUS_MODE' }
  | { type: 'TOGGLE_PARAGRAPH_FOCUS' }
  | { type: 'TOGGLE_AMBIENT_SOUND' }
  | { type: 'UPDATE_PLUGIN_STATE'; payload: { pluginId: string; state: any } }
  | { type: 'REGISTER_PLUGIN'; payload: Plugin }
  | { type: 'UNREGISTER_PLUGIN'; payload: string }
  | { type: 'REGISTER_COMMAND'; payload: Command }
  | { type: 'UNREGISTER_COMMAND'; payload: string }
  | { type: 'FORMAT'; payload: { type: FormatType; selection: Selection } }
  | { type: 'ADD_DECORATION'; payload: Decoration }
  | { type: 'REMOVE_DECORATION'; payload: string }
  | { type: 'SET_TOOLBAR_VISIBILITY'; payload: boolean }
  | { type: 'SET_TOOLBAR_POSITION'; payload: { x: number; y: number } };
