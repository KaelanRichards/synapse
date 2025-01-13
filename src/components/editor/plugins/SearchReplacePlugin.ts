import { BasePlugin, createPluginConfig } from './BasePlugin';
import type { Editor, Selection } from '../types';

interface SearchMatch {
  index: number;
  length: number;
  text: string;
}

interface SearchReplaceState extends Record<string, unknown> {
  searchTerm: string;
  replaceTerm: string;
  matches: SearchMatch[];
  currentMatchIndex: number;
  isActive: boolean;
  isCaseSensitive: boolean;
  isRegex: boolean;
}

export class SearchReplacePlugin extends BasePlugin<SearchReplaceState> {
  constructor() {
    super(
      createPluginConfig('search-replace', 'Search & Replace', '1.0.0', {
        priority: 1,
        options: {
          defaultCaseSensitive: false,
          defaultRegex: false,
        },
      }),
      {
        onMount: editor => {
          this.state = {
            searchTerm: '',
            replaceTerm: '',
            matches: [],
            currentMatchIndex: -1,
            isActive: false,
            isCaseSensitive: false,
            isRegex: false,
          };
          this.setupCommands();
        },
        onChange: content => {
          if (this.state.isActive && this.state.searchTerm) {
            this.updateMatches();
          }
        },
      }
    );
  }

  private setupCommands(): void {
    this.registerCommand({
      id: 'search',
      name: 'Search',
      description: 'Search in document',
      shortcut: '⌘F',
      category: 'search',
      execute: () => this.toggleSearch(),
    });

    this.registerCommand({
      id: 'find-next',
      name: 'Find Next',
      description: 'Go to next match',
      shortcut: '⌘G',
      category: 'search',
      isEnabled: () => this.state.matches.length > 0,
      execute: () => this.findNext(),
    });

    this.registerCommand({
      id: 'find-previous',
      name: 'Find Previous',
      description: 'Go to previous match',
      shortcut: '⇧⌘G',
      category: 'search',
      isEnabled: () => this.state.matches.length > 0,
      execute: () => this.findPrevious(),
    });

    this.registerCommand({
      id: 'replace',
      name: 'Replace',
      description: 'Replace current match',
      shortcut: '⌘H',
      category: 'search',
      isEnabled: () => this.state.currentMatchIndex >= 0,
      execute: () => this.replaceCurrent(),
    });

    this.registerCommand({
      id: 'replace-all',
      name: 'Replace All',
      description: 'Replace all matches',
      shortcut: '⇧⌘H',
      category: 'search',
      isEnabled: () => this.state.matches.length > 0,
      execute: () => this.replaceAll(),
    });
  }

  private toggleSearch(): void {
    this.state.isActive = !this.state.isActive;
    this.emit('search:toggle', this.state.isActive);

    if (this.state.isActive) {
      const selection = this.editor?.getSelectedText();
      if (selection && selection.text) {
        this.search(selection.text);
      }
    }
  }

  public search(term: string): void {
    this.state.searchTerm = term;
    this.updateMatches();
  }

  private updateMatches(): void {
    if (!this.editor) return;

    const content = this.editor.state.content;
    const matches: SearchMatch[] = [];

    if (!this.state.searchTerm) {
      this.state.matches = [];
      this.state.currentMatchIndex = -1;
      return;
    }

    let searchRegex: RegExp;
    if (this.state.isRegex) {
      try {
        searchRegex = new RegExp(
          this.state.searchTerm,
          this.state.isCaseSensitive ? 'g' : 'gi'
        );
      } catch (e) {
        this.emit('search:error', 'Invalid regex pattern');
        return;
      }
    } else {
      const escaped = this.state.searchTerm.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );
      searchRegex = new RegExp(
        escaped,
        this.state.isCaseSensitive ? 'g' : 'gi'
      );
    }

    let match;
    while ((match = searchRegex.exec(content)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        text: match[0],
      });
    }

    this.state.matches = matches;
    this.emit('search:matches-updated', matches);

    // Keep current match if still valid
    if (this.state.currentMatchIndex >= matches.length) {
      this.state.currentMatchIndex = matches.length > 0 ? 0 : -1;
    }

    if (this.state.currentMatchIndex >= 0) {
      this.highlightMatch(this.state.currentMatchIndex);
    }
  }

  private highlightMatch(index: number): void {
    if (!this.editor || index < 0 || index >= this.state.matches.length) return;

    const match = this.state.matches[index];
    this.editor.state.selection = {
      start: match.index,
      end: match.index + match.length,
      text: match.text,
    };

    this.state.currentMatchIndex = index;
    this.emit('search:current-match', index);
  }

  private findNext(): void {
    const nextIndex =
      this.state.currentMatchIndex < this.state.matches.length - 1
        ? this.state.currentMatchIndex + 1
        : 0;
    this.highlightMatch(nextIndex);
  }

  private findPrevious(): void {
    const prevIndex =
      this.state.currentMatchIndex > 0
        ? this.state.currentMatchIndex - 1
        : this.state.matches.length - 1;
    this.highlightMatch(prevIndex);
  }

  private replaceCurrent(): void {
    if (!this.editor || this.state.currentMatchIndex < 0) return;

    const match = this.state.matches[this.state.currentMatchIndex];
    const content = this.editor.state.content;

    const newContent =
      content.slice(0, match.index) +
      this.state.replaceTerm +
      content.slice(match.index + match.length);

    this.editor.state.content = newContent;
    this.updateMatches();
  }

  private replaceAll(): void {
    if (!this.editor || !this.state.matches.length) return;

    let content = this.editor.state.content;
    let offset = 0;

    for (const match of this.state.matches) {
      const adjustedIndex = match.index - offset;
      content =
        content.slice(0, adjustedIndex) +
        this.state.replaceTerm +
        content.slice(adjustedIndex + match.length);

      offset += match.length - this.state.replaceTerm.length;
    }

    this.editor.state.content = content;
    this.updateMatches();
  }

  public setSearchTerm(term: string): void {
    this.state.searchTerm = term;
    this.updateMatches();
  }

  public setReplaceTerm(term: string): void {
    this.state.replaceTerm = term;
  }

  public setCaseSensitive(isCaseSensitive: boolean): void {
    this.state.isCaseSensitive = isCaseSensitive;
    this.updateMatches();
  }

  public setRegex(isRegex: boolean): void {
    this.state.isRegex = isRegex;
    this.updateMatches();
  }

  public getState(): SearchReplaceState {
    return { ...this.state };
  }
}
