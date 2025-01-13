import { BasePlugin } from './BasePlugin';
import type { Selection, FormatType, Editor } from '../types';

interface MarkdownPluginState {
  activeFormats: FormatType[];
}

export class MarkdownPlugin extends BasePlugin {
  constructor() {
    super('markdown', 'Markdown Formatting');
    this.initCommands();
  }

  public init = (editor: Editor): void | (() => void) => {
    this.editor = editor;
    this.setPluginState<MarkdownPluginState>({ activeFormats: [] });
    return this.destroy;
  };

  private initCommands() {
    // Bold
    this.registerCommand({
      id: 'markdown.bold',
      name: 'Bold',
      description: 'Make text bold',
      shortcut: 'Ctrl+B',
      category: 'formatting',
      execute: () => this.format('bold'),
    });

    // Italic
    this.registerCommand({
      id: 'markdown.italic',
      name: 'Italic',
      description: 'Make text italic',
      shortcut: 'Ctrl+I',
      category: 'formatting',
      execute: () => this.format('italic'),
    });

    // Heading
    this.registerCommand({
      id: 'markdown.heading',
      name: 'Heading',
      description: 'Convert to heading',
      shortcut: 'Ctrl+H',
      category: 'formatting',
      execute: () => this.format('heading'),
    });

    // Link
    this.registerCommand({
      id: 'markdown.link',
      name: 'Link',
      description: 'Insert link',
      shortcut: 'Ctrl+K',
      category: 'formatting',
      execute: () => this.format('link'),
    });

    // Code
    this.registerCommand({
      id: 'markdown.code',
      name: 'Code',
      description: 'Format as code',
      shortcut: 'Ctrl+`',
      category: 'formatting',
      execute: () => this.format('code'),
    });

    // Quote
    this.registerCommand({
      id: 'markdown.quote',
      name: 'Quote',
      description: 'Format as quote',
      shortcut: 'Ctrl+Q',
      category: 'formatting',
      execute: () => this.format('quote'),
    });

    // List
    this.registerCommand({
      id: 'markdown.list',
      name: 'List',
      description: 'Create list',
      shortcut: 'Ctrl+L',
      category: 'formatting',
      execute: () => this.format('list'),
    });
  }

  private format(type: FormatType) {
    if (!this.editor) return;

    const { selection, content } = this.editor.state;
    if (!selection) return;

    let formattedText = '';
    const { start, end, text } = selection;

    switch (type) {
      case 'bold':
        formattedText = `**${text}**`;
        break;
      case 'italic':
        formattedText = `_${text}_`;
        break;
      case 'heading':
        formattedText = `\n# ${text}`;
        break;
      case 'link':
        formattedText = `[${text}]()`;
        break;
      case 'code':
        formattedText = `\`${text}\``;
        break;
      case 'quote':
        formattedText = text
          .split('\n')
          .map(line => `> ${line}`)
          .join('\n');
        break;
      case 'list':
        formattedText = text
          .split('\n')
          .map(line => `- ${line}`)
          .join('\n');
        break;
      default:
        return;
    }

    const newContent =
      content.substring(0, start) + formattedText + content.substring(end);

    this.dispatchAction({ type: 'SET_CONTENT', payload: newContent });

    // Update selection to include markdown syntax
    const newSelection: Selection = {
      start,
      end: start + formattedText.length,
      text: formattedText,
    };
    this.dispatchAction({ type: 'SET_SELECTION', payload: newSelection });

    // Update active formats
    const state = this.getPluginState<MarkdownPluginState>();
    if (state) {
      const uniqueFormats = Array.from(new Set([...state.activeFormats, type]));
      this.setPluginState<MarkdownPluginState>({
        activeFormats: uniqueFormats,
      });
    }
  }

  public hooks = {
    beforeContentChange: (content: string): string => {
      // Add any content preprocessing here
      return content;
    },
    afterContentChange: (content: string): void => {
      // Update active formats based on cursor position
      if (!this.editor?.state.selection) return;

      const activeFormats = this.detectActiveFormats(
        content,
        this.editor.state.selection
      );
      const state = this.getPluginState<MarkdownPluginState>();
      if (
        state &&
        JSON.stringify(state.activeFormats) !== JSON.stringify(activeFormats)
      ) {
        this.setPluginState<MarkdownPluginState>({ activeFormats });
      }
    },
  };

  private detectActiveFormats(
    content: string,
    selection: Selection
  ): FormatType[] {
    const activeFormats: FormatType[] = [];
    const line = content.split('\n').find((_, i, lines) => {
      const lineStart = lines.slice(0, i).join('\n').length + (i > 0 ? 1 : 0);
      const lineEnd = lineStart + lines[i].length;
      return selection.start >= lineStart && selection.start <= lineEnd;
    });

    if (!line) return activeFormats;

    // Check for formats
    if (line.match(/\*\*.*\*\*/)) activeFormats.push('bold');
    if (line.match(/_.*_/)) activeFormats.push('italic');
    if (line.match(/^#/)) activeFormats.push('heading');
    if (line.match(/\[.*\]\(.*\)/)) activeFormats.push('link');
    if (line.match(/`.*`/)) activeFormats.push('code');
    if (line.match(/^>/)) activeFormats.push('quote');
    if (line.match(/^-/)) activeFormats.push('list');

    return activeFormats;
  }
}
