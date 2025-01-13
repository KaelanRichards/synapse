import { StateCreator } from 'zustand';
import type { EditorStore } from '../types';
import type { FormatType, Selection } from '../../components/editor/types';

export interface FormatSlice {
  // State
  activeFormats: Set<FormatType>;

  // Actions
  format: (type: FormatType, selection: Selection) => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleCode: () => void;
  createLink: (url: string) => void;
  createHeading: (level: 1 | 2 | 3 | 4 | 5 | 6) => void;
  createList: (ordered: boolean) => void;
  createQuote: () => void;
}

export const createFormatSlice: StateCreator<
  EditorStore,
  [],
  [],
  FormatSlice
> = (set, get) => ({
  // State
  activeFormats: new Set(),

  // Actions
  format: (type: FormatType, selection: Selection) => {
    // Run plugin hooks before format
    const shouldContinue = get().runBeforeFormat(type, selection);
    if (shouldContinue === false) return;

    // Apply formatting
    const { content } = get();
    const { start, end } = selection;
    let newContent = content;

    switch (type) {
      case 'bold':
        newContent =
          content.slice(0, start) +
          `**${content.slice(start, end)}**` +
          content.slice(end);
        break;
      case 'italic':
        newContent =
          content.slice(0, start) +
          `_${content.slice(start, end)}_` +
          content.slice(end);
        break;
      case 'code':
        newContent =
          content.slice(0, start) +
          '`' +
          content.slice(start, end) +
          '`' +
          content.slice(end);
        break;
      // Add other format types here
    }

    // Update content and selection
    get().setContent(newContent);
    get().setSelection({
      start: start,
      end: end + 4, // Account for added markdown characters
      text: content.slice(start, end),
    });

    // Update active formats
    set(state => {
      state.activeFormats.add(type);
      return state;
    });

    // Run plugin hooks after format
    get().runAfterFormat(type, selection);
  },

  toggleBold: () => {
    const selection = get().selection;
    if (!selection) return;
    get().format('bold', selection);
  },

  toggleItalic: () => {
    const selection = get().selection;
    if (!selection) return;
    get().format('italic', selection);
  },

  toggleCode: () => {
    const selection = get().selection;
    if (!selection) return;
    get().format('code', selection);
  },

  createLink: (url: string) => {
    const selection = get().selection;
    if (!selection) return;
    const { content } = get();
    const { start, end } = selection;
    const newContent =
      content.slice(0, start) +
      `[${content.slice(start, end)}](${url})` +
      content.slice(end);
    get().setContent(newContent);
  },

  createHeading: (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    const selection = get().selection;
    if (!selection) return;
    const { content } = get();
    const { start, end } = selection;
    const prefix = '#'.repeat(level) + ' ';
    const newContent =
      content.slice(0, start) +
      prefix +
      content.slice(start, end) +
      content.slice(end);
    get().setContent(newContent);
  },

  createList: (ordered: boolean) => {
    const selection = get().selection;
    if (!selection) return;
    const { content } = get();
    const { start, end } = selection;
    const lines = content.slice(start, end).split('\n');
    const newLines = lines.map((line, i) =>
      ordered ? `${i + 1}. ${line}` : `- ${line}`
    );
    const newContent =
      content.slice(0, start) + newLines.join('\n') + content.slice(end);
    get().setContent(newContent);
  },

  createQuote: () => {
    const selection = get().selection;
    if (!selection) return;
    const { content } = get();
    const { start, end } = selection;
    const lines = content.slice(start, end).split('\n');
    const newLines = lines.map(line => `> ${line}`);
    const newContent =
      content.slice(0, start) + newLines.join('\n') + content.slice(end);
    get().setContent(newContent);
  },
});
