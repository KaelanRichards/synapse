import { BasePlugin, createPluginConfig } from './BasePlugin';
import type { Editor, Selection } from '../types';
import type { Command, Decoration } from '../types/plugin';

interface MarkdownState extends Record<string, unknown> {
  isPreviewEnabled: boolean;
  parsedHtml: string | null;
  syntaxHighlighting: boolean;
  autoFormatting: boolean;
}

export class MarkdownPlugin extends BasePlugin<MarkdownState> {
  constructor() {
    super(
      createPluginConfig('markdown', 'Markdown', '1.0.0', {
        priority: 3,
        options: {
          defaultSyntaxHighlighting: true,
          defaultAutoFormatting: true,
        },
      }),
      {
        onMount: editor => {
          this.state = {
            isPreviewEnabled: false,
            parsedHtml: null,
            syntaxHighlighting: true,
            autoFormatting: true,
          };
          this.setupCommands();
        },
        onChange: content => {
          if (this.state.isPreviewEnabled) {
            this.updatePreview(content);
          }
          if (this.state.syntaxHighlighting) {
            this.updateSyntaxHighlighting(content);
          }
          if (this.state.autoFormatting) {
            this.autoFormat(content);
          }
        },
      }
    );
  }

  private setupCommands(): void {
    this.registerCommand({
      id: 'toggle-preview',
      name: 'Toggle Preview',
      description: 'Toggle Markdown preview',
      shortcut: '⌘P',
      category: 'markdown',
      execute: () => this.togglePreview(),
    });

    this.registerCommand({
      id: 'toggle-syntax-highlighting',
      name: 'Toggle Syntax Highlighting',
      description: 'Toggle Markdown syntax highlighting',
      shortcut: '⌘⇧H',
      category: 'markdown',
      execute: () => this.toggleSyntaxHighlighting(),
    });

    this.registerCommand({
      id: 'toggle-auto-formatting',
      name: 'Toggle Auto Formatting',
      description: 'Toggle Markdown auto formatting',
      shortcut: '⌘⇧F',
      category: 'markdown',
      execute: () => this.toggleAutoFormatting(),
    });
  }

  private togglePreview(): void {
    this.state.isPreviewEnabled = !this.state.isPreviewEnabled;

    if (this.state.isPreviewEnabled && this.editor) {
      this.updatePreview(this.editor.state.content);
    } else {
      this.state.parsedHtml = null;
    }

    this.emit('markdown:preview-toggled', this.state.isPreviewEnabled);
  }

  private toggleSyntaxHighlighting(): void {
    this.state.syntaxHighlighting = !this.state.syntaxHighlighting;

    if (this.state.syntaxHighlighting && this.editor) {
      this.updateSyntaxHighlighting(this.editor.state.content);
    } else {
      this.decorations = [];
    }

    this.emit(
      'markdown:syntax-highlighting-toggled',
      this.state.syntaxHighlighting
    );
  }

  private toggleAutoFormatting(): void {
    this.state.autoFormatting = !this.state.autoFormatting;
    this.emit('markdown:auto-formatting-toggled', this.state.autoFormatting);
  }

  private updatePreview(content: string): void {
    // TODO: Implement markdown parsing
    this.state.parsedHtml = content;
    this.emit('markdown:preview-updated', this.state.parsedHtml);
  }

  private updateSyntaxHighlighting(content: string): void {
    // TODO: Implement syntax highlighting
    const decorations: Decoration[] = [];

    // Example decoration for headers
    const headerRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;

    while ((match = headerRegex.exec(content)) !== null) {
      decorations.push({
        id: `header-${match.index}`,
        type: 'inline',
        range: {
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
        },
        attributes: {
          'data-level': match[1].length.toString(),
        },
        className: 'markdown-header',
      });
    }

    this.decorations = decorations;
    this.emit('markdown:decorations-updated', decorations);
  }

  private autoFormat(content: string): void {
    if (!this.editor) return;

    // TODO: Implement auto-formatting
    // Example: Auto-complete lists
    const lastLine = content.split('\n').pop() || '';
    if (lastLine.match(/^-\s+$/)) {
      const newContent = content.slice(0, -lastLine.length);
      this.editor.state.content = newContent;
    }
  }

  public getPreviewHtml(): string | null {
    return this.state.parsedHtml;
  }

  public isPreviewEnabled(): boolean {
    return this.state.isPreviewEnabled;
  }

  public isSyntaxHighlightingEnabled(): boolean {
    return this.state.syntaxHighlighting;
  }

  public isAutoFormattingEnabled(): boolean {
    return this.state.autoFormatting;
  }
}
