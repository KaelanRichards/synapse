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

export type FormatType =
  | 'bold'
  | 'italic'
  | 'heading'
  | 'link'
  | 'code'
  | 'quote';

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
}

export interface EditorProps {
  initialContent?: string | null | undefined;
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
}
