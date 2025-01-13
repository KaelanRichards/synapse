import { Plugin, Command, Editor } from '../types';
import { nanoid } from 'nanoid';

interface SearchReplaceState {
  isOpen: boolean;
  searchTerm: string;
  replaceTerm: string;
  matches: number[];
  currentMatch: number;
  caseSensitive: boolean;
  useRegex: boolean;
}

export class SearchReplacePlugin implements Plugin {
  public readonly id = 'search-replace';
  public readonly name = 'Search & Replace';
  private editor: Editor | null = null;
  private state: SearchReplaceState = {
    isOpen: false,
    searchTerm: '',
    replaceTerm: '',
    matches: [],
    currentMatch: -1,
    caseSensitive: false,
    useRegex: false,
  };

  public commands: Command[] = [
    {
      id: 'toggle-search',
      name: 'Toggle Search',
      shortcut: '⌘F',
      category: 'Search',
      execute: () => this.toggleSearch(),
    },
    {
      id: 'find-next',
      name: 'Find Next',
      shortcut: '⌘G',
      category: 'Search',
      execute: () => this.findNext(),
    },
    {
      id: 'find-previous',
      name: 'Find Previous',
      shortcut: '⌘⇧G',
      category: 'Search',
      execute: () => this.findPrevious(),
    },
    {
      id: 'replace',
      name: 'Replace',
      shortcut: '⌘H',
      category: 'Search',
      execute: () => this.replace(),
    },
    {
      id: 'replace-all',
      name: 'Replace All',
      shortcut: '⌘⇧H',
      category: 'Search',
      execute: () => this.replaceAll(),
    },
  ];

  public init(editor: Editor) {
    this.editor = editor;
    editor.dispatch({
      type: 'UPDATE_PLUGIN_STATE',
      payload: { pluginId: this.id, state: this.state },
    });

    return () => {
      this.editor = null;
    };
  }

  private toggleSearch() {
    if (!this.editor) return;

    this.state = {
      ...this.state,
      isOpen: !this.state.isOpen,
    };

    if (this.state.isOpen) {
      const selection = this.editor.state.selection;
      if (selection && selection.text) {
        this.updateSearch(selection.text);
      }
    }

    this.updateEditorState();
  }

  private updateSearch(searchTerm: string) {
    if (!this.editor) return;

    this.state = {
      ...this.state,
      searchTerm,
      matches: this.findMatches(searchTerm),
      currentMatch: 0,
    };

    this.updateEditorState();
  }

  private findMatches(searchTerm: string): number[] {
    if (!this.editor || !searchTerm) return [];

    const content = this.editor.state.content;
    const matches: number[] = [];
    let searchRegex: RegExp;

    try {
      if (this.state.useRegex) {
        searchRegex = new RegExp(
          searchTerm,
          this.state.caseSensitive ? 'g' : 'gi'
        );
      } else {
        searchRegex = new RegExp(
          searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          this.state.caseSensitive ? 'g' : 'gi'
        );
      }

      let match;
      while ((match = searchRegex.exec(content)) !== null) {
        matches.push(match.index);
      }
    } catch (e) {
      console.error('Invalid regex:', e);
    }

    return matches;
  }

  private findNext() {
    if (!this.editor || this.state.matches.length === 0) return;

    const nextMatch = (this.state.currentMatch + 1) % this.state.matches.length;
    this.selectMatch(nextMatch);
  }

  private findPrevious() {
    if (!this.editor || this.state.matches.length === 0) return;

    const prevMatch =
      this.state.currentMatch > 0
        ? this.state.currentMatch - 1
        : this.state.matches.length - 1;
    this.selectMatch(prevMatch);
  }

  private selectMatch(index: number) {
    if (!this.editor) return;

    const matchStart = this.state.matches[index];
    const matchEnd = matchStart + this.state.searchTerm.length;

    this.state = {
      ...this.state,
      currentMatch: index,
    };

    this.editor.dispatch({
      type: 'SET_SELECTION',
      payload: {
        start: matchStart,
        end: matchEnd,
        text: this.editor.state.content.substring(matchStart, matchEnd),
      },
    });

    this.updateEditorState();
  }

  private replace() {
    if (!this.editor || this.state.matches.length === 0) return;

    const matchStart = this.state.matches[this.state.currentMatch];
    const matchEnd = matchStart + this.state.searchTerm.length;
    const content = this.editor.state.content;

    const newContent =
      content.substring(0, matchStart) +
      this.state.replaceTerm +
      content.substring(matchEnd);

    this.editor.dispatch({ type: 'SET_CONTENT', payload: newContent });

    // Update matches after replacement
    this.state = {
      ...this.state,
      matches: this.findMatches(this.state.searchTerm),
      currentMatch: Math.min(
        this.state.currentMatch,
        this.state.matches.length - 1
      ),
    };

    this.updateEditorState();
  }

  private replaceAll() {
    if (!this.editor || !this.state.searchTerm) return;

    let content = this.editor.state.content;
    try {
      const searchRegex = this.state.useRegex
        ? new RegExp(
            this.state.searchTerm,
            this.state.caseSensitive ? 'g' : 'gi'
          )
        : new RegExp(
            this.state.searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            this.state.caseSensitive ? 'g' : 'gi'
          );

      content = content.replace(searchRegex, this.state.replaceTerm);
      this.editor.dispatch({ type: 'SET_CONTENT', payload: content });

      // Reset search state after replace all
      this.state = {
        ...this.state,
        matches: [],
        currentMatch: -1,
      };

      this.updateEditorState();
    } catch (e) {
      console.error('Invalid regex:', e);
    }
  }

  private updateEditorState() {
    if (!this.editor) return;

    this.editor.dispatch({
      type: 'UPDATE_PLUGIN_STATE',
      payload: { pluginId: this.id, state: this.state },
    });
  }
}
