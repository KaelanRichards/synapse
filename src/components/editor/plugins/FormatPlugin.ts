import type { Plugin, Editor, FormatType, Selection, Command } from '../types';

export class FormatPlugin implements Plugin {
  public readonly id = 'format';
  public readonly name = 'Format';
  private editor: Editor | null = null;
  public commands: Command[] = [];

  init(editor: Editor) {
    this.editor = editor;
    this.registerCommands();

    // Register all commands with the editor
    this.commands.forEach(command => {
      editor.registerCommand(command);
    });

    return () => {
      this.editor = null;
    };
  }

  private registerCommands() {
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

    formatTypes.forEach(type => {
      const command: Command = {
        id: `format-${type}`,
        name: type.charAt(0).toUpperCase() + type.slice(1),
        shortcut: shortcuts[type],
        category: 'Format',
        execute: () => this.format(type),
      };
      this.commands.push(command);
    });
  }

  private format(type: FormatType) {
    if (!this.editor) return;
    const { selection, content } = this.editor.state;
    if (!selection) return;

    const prefix = this.getFormatPrefix(type);
    const suffix = this.getFormatSuffix(type);
    const newContent =
      content.slice(0, selection.start) +
      prefix +
      selection.text +
      suffix +
      content.slice(selection.end);

    this.editor.dispatch({ type: 'SET_CONTENT', payload: newContent });
  }

  private getFormatPrefix(type: FormatType): string {
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
  }

  private getFormatSuffix(type: FormatType): string {
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
  }
}
