import { BasePlugin, createPluginConfig } from './BasePlugin';
import type { Editor, FormatType, Selection } from '../types';
import type { Command } from '../types/plugin';

interface FormatState extends Record<string, unknown> {
  lastFormat: FormatType | null;
  activeFormats: Set<FormatType>;
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

export class FormatPlugin extends BasePlugin<FormatState> {
  constructor() {
    super(
      createPluginConfig('format', 'Format', '1.0.0', {
        priority: 1,
        options: {
          shortcuts,
          formatTypes,
        },
      }),
      {
        onMount: editor => {
          this.state = {
            lastFormat: null,
            activeFormats: new Set(),
          };
          this.setupCommands();
        },
        onChange: (content, prevContent) => {
          this.updateActiveFormats();
        },
        onSelectionChange: selection => {
          if (selection) {
            this.updateActiveFormats();
          }
        },
      }
    );
  }

  private setupCommands(): void {
    formatTypes.forEach(type => {
      this.registerCommand({
        id: `format:${type}`,
        name: `Format ${type}`,
        description: `Format selection with ${type}`,
        shortcut: shortcuts[type],
        category: 'format',
        isEnabled: () => this.editor?.getSelectedText() !== null,
        execute: () => this.applyFormat(type),
      });
    });
  }

  private updateActiveFormats(): void {
    const selection = this.editor?.getSelectedText();
    if (!selection) return;

    const activeFormats = new Set<FormatType>();
    const { text } = selection;

    formatTypes.forEach(type => {
      const prefix = getFormatPrefix(type);
      if (text.startsWith(prefix) && text.endsWith(prefix)) {
        activeFormats.add(type);
      }
    });

    this.state.activeFormats = activeFormats;
    this.emit('format:active-formats-changed', Array.from(activeFormats));
  }

  private applyFormat(type: FormatType): void {
    const selection = this.editor?.getSelectedText();
    if (!selection) return;

    if (this.beforeFormat?.(type, selection) === false) {
      return;
    }

    const prefix = getFormatPrefix(type);
    const { text } = selection;
    let newText = text;

    // Toggle format
    if (text.startsWith(prefix) && text.endsWith(prefix)) {
      newText = text.slice(prefix.length, -prefix.length);
    } else {
      newText = `${prefix}${text}${prefix}`;
    }

    this.editor?.update(() => {
      const content = this.editor?.state.content || '';
      const newContent =
        content.slice(0, selection.start) +
        newText +
        content.slice(selection.end);

      this.editor!.state.content = newContent;
      this.editor!.state.selection = {
        start: selection.start,
        end: selection.start + newText.length,
        text: newText,
      };
    });

    this.state.lastFormat = type;
    this.afterFormat?.(type, selection);
  }

  public getActiveFormats(): FormatType[] {
    return Array.from(this.state.activeFormats);
  }

  public isFormatActive(type: FormatType): boolean {
    return this.state.activeFormats.has(type);
  }
}
