import { createPlugin } from './BasePlugin';
import type { Editor, Selection, FormatType } from '../types';

interface MarkdownState {
  activeFormats: FormatType[];
}

const detectActiveFormats = (
  content: string,
  selection: Selection
): FormatType[] => {
  const activeFormats: FormatType[] = [];
  const selectedText = content.slice(selection.start, selection.end);

  // Check for bold
  if (/^\*\*.*\*\*$/.test(selectedText) || /__.*__$/.test(selectedText)) {
    activeFormats.push('bold');
  }

  // Check for italic
  if (/^_.*_$/.test(selectedText) || /^\*.*\*$/.test(selectedText)) {
    activeFormats.push('italic');
  }

  // Check for code
  if (/^`.*`$/.test(selectedText)) {
    activeFormats.push('code');
  }

  // Check for heading (at line start)
  const lineStart = content.lastIndexOf('\n', selection.start) + 1;
  const lineContent = content.slice(lineStart, selection.end);
  if (/^#+ /.test(lineContent)) {
    activeFormats.push('heading');
  }

  // Check for quote
  if (/^> /.test(lineContent)) {
    activeFormats.push('quote');
  }

  // Check for list
  if (/^[*-] /.test(lineContent)) {
    activeFormats.push('list');
  }

  return activeFormats;
};

export const MarkdownPlugin = createPlugin<MarkdownState>({
  id: 'markdown',
  name: 'Markdown Formatting',

  initialState: {
    activeFormats: [],
  },

  setup: (editor: Editor) => {
    let pluginState = {
      activeFormats: [] as FormatType[],
    };

    const updateState = (newState: Partial<MarkdownState>) => {
      pluginState = { ...pluginState, ...newState };
      return pluginState;
    };

    const format = (type: FormatType) => {
      const { selection } = editor.state;
      if (!selection) return;

      let prefix = '';
      let suffix = '';

      switch (type) {
        case 'bold':
          prefix = '**';
          suffix = '**';
          break;
        case 'italic':
          prefix = '_';
          suffix = '_';
          break;
        case 'code':
          prefix = '`';
          suffix = '`';
          break;
        case 'heading':
          prefix = '# ';
          break;
        case 'quote':
          prefix = '> ';
          break;
        case 'list':
          prefix = '- ';
          break;
      }

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

      // Update active formats
      const newActiveFormats = detectActiveFormats(
        editor.state.content,
        editor.state.selection
      );
      updateState({ activeFormats: newActiveFormats });
    };

    // Subscribe to content and selection changes
    editor.on('change', () => {
      if (editor.state.selection) {
        const activeFormats = detectActiveFormats(
          editor.state.content,
          editor.state.selection
        );
        if (
          JSON.stringify(pluginState.activeFormats) !==
          JSON.stringify(activeFormats)
        ) {
          updateState({ activeFormats });
        }
      }
    });

    // Register markdown commands
    editor.registerCommand({
      id: 'markdown.bold',
      name: 'Bold',
      description: 'Make text bold',
      shortcut: 'Ctrl+B',
      category: 'formatting',
      execute: () => format('bold'),
    });

    editor.registerCommand({
      id: 'markdown.italic',
      name: 'Italic',
      description: 'Make text italic',
      shortcut: 'Ctrl+I',
      category: 'formatting',
      execute: () => format('italic'),
    });

    editor.registerCommand({
      id: 'markdown.code',
      name: 'Code',
      description: 'Format as inline code',
      shortcut: 'Ctrl+`',
      category: 'formatting',
      execute: () => format('code'),
    });

    editor.registerCommand({
      id: 'markdown.heading',
      name: 'Heading',
      description: 'Convert to heading',
      shortcut: 'Ctrl+H',
      category: 'formatting',
      execute: () => format('heading'),
    });

    editor.registerCommand({
      id: 'markdown.quote',
      name: 'Quote',
      description: 'Convert to blockquote',
      shortcut: 'Ctrl+>',
      category: 'formatting',
      execute: () => format('quote'),
    });

    editor.registerCommand({
      id: 'markdown.list',
      name: 'List',
      description: 'Convert to list item',
      shortcut: 'Ctrl+L',
      category: 'formatting',
      execute: () => format('list'),
    });

    // Return cleanup function
    return () => {
      pluginState = {
        activeFormats: [],
      };
    };
  },
});
