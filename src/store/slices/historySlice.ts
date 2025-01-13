import { StateCreator } from 'zustand';
import type { EditorState, UndoStackItem } from '../../components/editor/types';
import type {
  ContentSlice,
  EditorActions,
  FormatSlice,
  UISlice,
  PluginSlice,
} from '../types';

export interface HistorySlice {
  undoStack: UndoStackItem[];
  redoStack: UndoStackItem[];
  lastUndoTime: number;

  // History actions
  undo: () => void;
  redo: () => void;
  addToUndoStack: (item: UndoStackItem) => void;
  clearHistory: () => void;

  // History state
  canUndo: () => boolean;
  canRedo: () => boolean;
  getLastUndoItem: () => UndoStackItem | undefined;
  getLastRedoItem: () => UndoStackItem | undefined;
}

export type EditorStore = EditorState &
  ContentSlice &
  FormatSlice &
  UISlice &
  PluginSlice &
  HistorySlice &
  EditorActions;

const MAX_UNDO_STACK_SIZE = 100;
const MERGE_THRESHOLD = 1000; // 1 second in milliseconds

export const createHistorySlice: StateCreator<
  EditorStore,
  [],
  [],
  HistorySlice
> = (set, get) => ({
  undoStack: [],
  redoStack: [],
  lastUndoTime: 0,

  undo: () => {
    const { undoStack, redoStack } = get();

    if (undoStack.length < 2) return; // Need at least 2 items to undo

    const currentState = undoStack[undoStack.length - 1];
    const previousState = undoStack[undoStack.length - 2];

    set(state => {
      // Update content and selection
      state.content = previousState.content;
      state.selection = previousState.selection;

      // Update stacks
      state.undoStack = state.undoStack.slice(0, -1);
      state.redoStack = [...state.redoStack, currentState];

      // Update stats
      const words = previousState.content
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      const lines = previousState.content.split('\n').length;
      const readingTime = Math.ceil(words / 200);
      state.stats = {
        ...state.stats,
        wordCount: words,
        charCount: previousState.content.length,
        linesCount: lines,
        readingTime,
      };

      return state;
    });
  },

  redo: () => {
    const { redoStack } = get();

    if (redoStack.length === 0) return;

    const nextState = redoStack[redoStack.length - 1];

    set(state => {
      // Update content and selection
      state.content = nextState.content;
      state.selection = nextState.selection;

      // Update stacks
      state.undoStack = [...state.undoStack, nextState];
      state.redoStack = state.redoStack.slice(0, -1);

      // Update stats
      const words = nextState.content
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      const lines = nextState.content.split('\n').length;
      const readingTime = Math.ceil(words / 200);
      state.stats = {
        ...state.stats,
        wordCount: words,
        charCount: nextState.content.length,
        linesCount: lines,
        readingTime,
      };

      return state;
    });
  },

  addToUndoStack: (item: UndoStackItem) => {
    set(state => {
      const now = Date.now();
      const lastItem = state.undoStack[state.undoStack.length - 1];

      // Check if we should merge with the last item
      if (
        lastItem &&
        now - state.lastUndoTime < MERGE_THRESHOLD &&
        // Only merge small changes
        Math.abs(item.content.length - lastItem.content.length) < 10
      ) {
        // Update the last item instead of adding a new one
        state.undoStack[state.undoStack.length - 1] = item;
      } else {
        // Add new item and maintain max size
        state.undoStack = [
          ...state.undoStack.slice(-MAX_UNDO_STACK_SIZE + 1),
          item,
        ];
      }

      // Clear redo stack when new changes are made
      state.redoStack = [];
      state.lastUndoTime = now;

      return state;
    });
  },

  clearHistory: () =>
    set(state => {
      state.undoStack = [];
      state.redoStack = [];
      state.lastUndoTime = 0;
      return state;
    }),

  canUndo: () => get().undoStack.length > 1,

  canRedo: () => get().redoStack.length > 0,

  getLastUndoItem: () => {
    const { undoStack } = get();
    return undoStack[undoStack.length - 1];
  },

  getLastRedoItem: () => {
    const { redoStack } = get();
    return redoStack[redoStack.length - 1];
  },
});
