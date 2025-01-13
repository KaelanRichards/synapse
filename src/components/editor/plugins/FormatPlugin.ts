import { createPlugin } from './BasePlugin';
import type { Editor, FormatType, Selection } from '../types';

interface FormatState {
  lastFormat: FormatType | null;
}

const formatTypes: FormatType[] = [
  'bold',
  'italic',
  'heading',
  'link',
  'code',
  'quote',
  'list',
];

const shortcuts: Record<FormatType, string> = {
  bold: '⌘B',
  italic: '⌘I',
  heading: '⌘H',
  link: '⌘K',
  code: '⌘E',
  quote: '⇧⌘.',
  list: '⌘L',
  table: '⌘T',
  image: '⌘P',
};

const getFormatPrefix = (type: FormatType): string => {
  switch (type) {
    case 'bold':
      return '**';
    case 'italic':
      return '_';
    case 'heading':
      return '# ';
    case 'link':
      return '[';
    case 'code':
      return '`';
    case 'quote':
      return '> ';
    case 'list':
      return '- ';
    default:
      return '';
  }
};

const getFormatSuffix = (type: FormatType): string => {
  switch (type) {
    case 'bold':
      return '**';
    case 'italic':
      return '_';
    case 'link':
      return '](url)';
    case 'code':
      return '`';
    default:
      return '';
  }
};

export const FormatPlugin = createPlugin<FormatState>({
  id: 'format',
  name: 'Format',

  initialState: {
    lastFormat: null,
  },

  setup: (editor: Editor) => {
    let pluginState = {
      lastFormat: null as FormatType | null,
    };

    const updateState = (newState: Partial<FormatState>) => {
      pluginState = { ...pluginState, ...newState };
      return pluginState;
    };

    const format = (type: FormatType) => {
      const { selection } = editor.state;
      if (!selection) return;

      // Call beforeFormat hook
      if (editor.hooks?.beforeFormat?.(type, selection) === false) {
        return;
      }

      const prefix = getFormatPrefix(type);
      const suffix = getFormatSuffix(type);

      const beforeSelection = editor.state.content.slice(0, selection.start);
      const afterSelection = editor.state.content.slice(selection.end);
      const selectedText = selection.text;

      editor.state.content =
        beforeSelection + prefix + selectedText + suffix + afterSelection;

      // Update selection to include formatting
      editor.state.selection = {
        start: selection.start + prefix.length,
        end: selection.end + prefix.length,
        text: selectedText,
      };

      updateState({ lastFormat: type });

      // Call afterFormat hook
      editor.hooks?.afterFormat?.(type, selection);
    };

    // Register format commands
    formatTypes.forEach(type => {
      editor.registerCommand({
        id: `format-${type}`,
        name: type.charAt(0).toUpperCase() + type.slice(1),
        shortcut: shortcuts[type],
        category: 'Format',
        execute: () => format(type),
      });
    });

    // Return cleanup function
    return () => {
      pluginState = {
        lastFormat: null,
      };
    };
  },
});
