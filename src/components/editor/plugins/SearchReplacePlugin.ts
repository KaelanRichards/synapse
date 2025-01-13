import { createPlugin } from './BasePlugin';
import type { Editor, Selection } from '../types';

interface SearchReplaceState {
  isOpen: boolean;
  searchTerm: string;
  replaceTerm: string;
  matches: number[];
  currentMatch: number;
  caseSensitive: boolean;
  useRegex: boolean;
}

export const SearchReplacePlugin = createPlugin<SearchReplaceState>({
  id: 'search-replace',
  name: 'Search & Replace',

  initialState: {
    isOpen: false,
    searchTerm: '',
    replaceTerm: '',
    matches: [],
    currentMatch: -1,
    caseSensitive: false,
    useRegex: false,
  },

  setup: (editor: Editor) => {
    let pluginState = {
      isOpen: false,
      searchTerm: '',
      replaceTerm: '',
      matches: [] as number[],
      currentMatch: -1,
      caseSensitive: false,
      useRegex: false,
    };

    const updateState = (newState: Partial<SearchReplaceState>) => {
      pluginState = { ...pluginState, ...newState };
      return pluginState;
    };

    const createSearchRegex = (searchTerm: string): RegExp => {
      const flags = pluginState.caseSensitive ? 'g' : 'gi';
      return pluginState.useRegex
        ? new RegExp(searchTerm, flags)
        : new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    };

    const findMatches = (searchTerm: string): number[] => {
      if (!searchTerm) return [];
      const regex = createSearchRegex(searchTerm);
      const matches: number[] = [];
      let match;
      while ((match = regex.exec(editor.state.content)) !== null) {
        matches.push(match.index);
      }
      return matches;
    };

    const selectMatch = (index: number) => {
      if (index >= 0 && index < pluginState.matches.length) {
        const matchStart = pluginState.matches[index];
        const matchEnd = matchStart + pluginState.searchTerm.length;
        editor.state.selection = {
          start: matchStart,
          end: matchEnd,
          text: editor.state.content.slice(matchStart, matchEnd),
        };
        updateState({ currentMatch: index });
      }
    };

    // Register commands
    editor.registerCommand({
      id: 'toggle-search',
      name: 'Toggle Search',
      shortcut: '⌘F',
      category: 'Search',
      execute: () => {
        const isOpen = !pluginState.isOpen;
        if (isOpen && editor.state.selection) {
          const searchTerm = editor.state.selection.text;
          const matches = findMatches(searchTerm);
          updateState({
            isOpen,
            searchTerm,
            matches,
            currentMatch: matches.length > 0 ? 0 : -1,
          });
          if (matches.length > 0) {
            selectMatch(0);
          }
        } else {
          updateState({ isOpen });
        }
      },
    });

    editor.registerCommand({
      id: 'find-next',
      name: 'Find Next',
      shortcut: '⌘G',
      category: 'Search',
      execute: () => {
        if (pluginState.matches.length > 0) {
          const nextMatch =
            (pluginState.currentMatch + 1) % pluginState.matches.length;
          selectMatch(nextMatch);
        }
      },
    });

    editor.registerCommand({
      id: 'find-previous',
      name: 'Find Previous',
      shortcut: '⌘⇧G',
      category: 'Search',
      execute: () => {
        if (pluginState.matches.length > 0) {
          const prevMatch =
            pluginState.currentMatch > 0
              ? pluginState.currentMatch - 1
              : pluginState.matches.length - 1;
          selectMatch(prevMatch);
        }
      },
    });

    editor.registerCommand({
      id: 'replace',
      name: 'Replace',
      category: 'Search',
      execute: () => {
        if (pluginState.currentMatch >= 0) {
          const matchStart = pluginState.matches[pluginState.currentMatch];
          const matchEnd = matchStart + pluginState.searchTerm.length;
          const beforeMatch = editor.state.content.slice(0, matchStart);
          const afterMatch = editor.state.content.slice(matchEnd);
          const newContent = beforeMatch + pluginState.replaceTerm + afterMatch;

          // Update editor content
          editor.state.content = newContent;

          // Update matches after replace
          const newMatches = findMatches(pluginState.searchTerm);
          updateState({
            matches: newMatches,
            currentMatch: Math.min(
              pluginState.currentMatch,
              newMatches.length - 1
            ),
          });
        }
      },
    });

    editor.registerCommand({
      id: 'replace-all',
      name: 'Replace All',
      category: 'Search',
      execute: () => {
        if (pluginState.searchTerm) {
          const regex = createSearchRegex(pluginState.searchTerm);
          editor.state.content = editor.state.content.replace(
            regex,
            pluginState.replaceTerm
          );
          updateState({
            matches: [],
            currentMatch: -1,
          });
        }
      },
    });

    editor.registerCommand({
      id: 'toggle-case-sensitive',
      name: 'Toggle Case Sensitive',
      category: 'Search',
      execute: () => {
        const caseSensitive = !pluginState.caseSensitive;
        const matches = findMatches(pluginState.searchTerm);
        updateState({
          caseSensitive,
          matches,
          currentMatch: matches.length > 0 ? 0 : -1,
        });
        if (matches.length > 0) {
          selectMatch(0);
        }
      },
    });

    editor.registerCommand({
      id: 'toggle-regex',
      name: 'Toggle Regex',
      category: 'Search',
      execute: () => {
        const useRegex = !pluginState.useRegex;
        const matches = findMatches(pluginState.searchTerm);
        updateState({
          useRegex,
          matches,
          currentMatch: matches.length > 0 ? 0 : -1,
        });
        if (matches.length > 0) {
          selectMatch(0);
        }
      },
    });

    editor.registerCommand({
      id: 'setSearchTerm',
      name: 'Set Search Term',
      category: 'Search',
      execute: (term: string) => {
        const matches = findMatches(term);
        updateState({
          searchTerm: term,
          matches,
          currentMatch: matches.length > 0 ? 0 : -1,
        });
        if (matches.length > 0) {
          selectMatch(0);
        }
      },
    });

    editor.registerCommand({
      id: 'setReplaceTerm',
      name: 'Set Replace Term',
      category: 'Search',
      execute: (term: string) => {
        updateState({ replaceTerm: term });
      },
    });

    // Return cleanup function
    return () => {
      pluginState = {
        isOpen: false,
        searchTerm: '',
        replaceTerm: '',
        matches: [],
        currentMatch: -1,
        caseSensitive: false,
        useRegex: false,
      };
    };
  },
});
