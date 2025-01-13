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

// Plugin System Types
export interface Plugin {
  id: string;
  name: string;
  state?: any;
  init?: (editor: Editor) => void | (() => void);
  destroy?: () => void;
  commands?: Command[];
  getCommands?: (editor: Editor) => Command[];
  setup?: (editor: Editor) => void | (() => void);
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
  subscribe: (listener: (state: EditorState) => void) => () => void;
  registerPlugin: (plugin: Plugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  registerCommand: (command: Command) => void;
  executeCommand: (commandId: string) => void;
  addDecoration: (decoration: Decoration) => void;
  removeDecoration: (decorationId: string) => void;
  save?: () => Promise<void>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler: (...args: any[]) => void) => void;
  update: (updater: () => void) => void;
  getSelectedText: () => Selection | null;
  hooks?: {
    beforeContentChange?: (content: string) => string;
    afterContentChange?: (content: string) => void;
    beforeFormat?: (type: FormatType, selection: Selection) => boolean;
    afterFormat?: (type: FormatType, selection: Selection) => void;
  };
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
  isLocalFocusMode: boolean;
  isParagraphFocus: boolean;
  isAmbientSound: boolean;
  showToolbar: boolean;
  toolbarPosition: { x: number; y: number };
  focusMode: {
    enabled: boolean;
    hideCommands: boolean;
    dimSurroundings: boolean;
  };
  typewriterMode: {
    enabled: boolean;
    sound: boolean;
    scrollIntoView: boolean;
  };
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
