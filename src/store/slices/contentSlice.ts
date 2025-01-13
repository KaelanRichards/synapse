import { StateCreator } from 'zustand';
import type { EditorStore } from '../types';
import type { Selection } from '../../components/editor/types';

export interface ContentSlice {
  // State
  content: string;
  selection: Selection | null;

  // Actions
  setContent: (content: string) => void;
  setSelection: (selection: Selection | null) => void;
  insertText: (text: string, at?: number) => void;
  deleteText: (start: number, end: number) => void;
  getSelectedText: () => string | null;
}

export const createContentSlice: StateCreator<
  EditorStore,
  [],
  [],
  ContentSlice
> = (set, get) => ({
  // State
  content: '',
  selection: null,

  // Actions
  setContent: content => {
    // Run plugin hooks before content change
    const modifiedContent = get().runBeforeContentChange(content) ?? content;

    set(state => {
      state.content = modifiedContent;
      // Update stats when content changes
      const words = modifiedContent.trim().split(/\s+/).filter(Boolean).length;
      const lines = modifiedContent.split('\n').length;
      const readingTime = Math.ceil(words / 200);
      state.stats = {
        wordCount: words,
        charCount: modifiedContent.length,
        timeSpent: state.stats.timeSpent,
        linesCount: lines,
        readingTime,
      };
      return state;
    });

    // Run plugin hooks after content change
    get().runAfterContentChange(modifiedContent);

    const selection = get().selection;
    // Add to undo stack only if we have a valid selection or no selection
    get().addToUndoStack({
      content: modifiedContent,
      selection: selection || {
        start: modifiedContent.length,
        end: modifiedContent.length,
        text: '',
      },
      timestamp: Date.now(),
    });
  },

  setSelection: selection =>
    set(state => {
      state.selection = selection;
      return state;
    }),

  insertText: (text, at) => {
    const { content, selection } = get();
    const insertPosition = at ?? selection?.start ?? content.length;
    const newContent =
      content.slice(0, insertPosition) + text + content.slice(insertPosition);

    get().setContent(newContent);

    // Update selection after insert
    if (selection) {
      get().setSelection({
        start: insertPosition + text.length,
        end: insertPosition + text.length,
        text: '',
      });
    }
  },

  deleteText: (start, end) => {
    const { content } = get();
    const newContent = content.slice(0, start) + content.slice(end);
    get().setContent(newContent);

    // Update selection after delete
    get().setSelection({
      start,
      end: start,
      text: '',
    });
  },

  getSelectedText: () => {
    const { content, selection } = get();
    if (!selection) return null;
    return content.slice(selection.start, selection.end);
  },
});
