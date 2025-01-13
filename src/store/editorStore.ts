import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import type { EditorStore } from './types';
import { AutosavePlugin } from '@/components/editor/plugins/AutosavePlugin';
import { FormatPlugin } from '@/components/editor/plugins/FormatPlugin';
import type {
  Command,
  Selection,
  UndoStackItem,
  FormatType,
  Decoration,
} from '@/components/editor/types';
import type { Plugin } from '@/components/editor/types/plugin';

enableMapSet();

export interface EditorState {
  content: string;
  selection: Selection | null;
  plugins: Map<string, Plugin>;
  commands: Map<string, Command>;
  decorations: Map<string, Decoration>;
  undoStack: UndoStackItem[];
  redoStack: UndoStackItem[];
  lastUndoTime: number;
  stats: {
    wordCount: number;
    charCount: number;
    timeSpent: number;
    linesCount: number;
    readingTime: number;
  };
  saveStatus: 'saved' | 'saving' | 'error' | 'unsaved';
  showToolbar: boolean;
  toolbarPosition: { x: number; y: number };
  activeFormats: Set<FormatType>;
}

const useEditorStore = create<EditorStore>()(
  immer((set, get) => ({
    // Initial state
    content: '',
    selection: null as Selection | null,
    plugins: new Map(),
    commands: new Map(),
    decorations: new Map(),
    cleanupFunctions: new Map(),
    undoStack: [],
    redoStack: [],
    lastUndoTime: 0,
    stats: {
      wordCount: 0,
      charCount: 0,
      timeSpent: 0,
      linesCount: 0,
      readingTime: 0,
    },
    saveStatus: 'saved',
    showToolbar: false,
    toolbarPosition: { x: 0, y: 0 },
    activeFormats: new Set(),

    // Actions
    setContent: content =>
      set(state => {
        state.content = content;
      }),
    setSelection: selection =>
      set(state => {
        state.selection = selection;
      }),
    insertText: (text, at) => {
      const state = get();
      const insertPosition =
        at ?? state.selection?.start ?? state.content.length;
      set(state => {
        state.content =
          state.content.slice(0, insertPosition) +
          text +
          state.content.slice(insertPosition);
      });
    },
    deleteText: (start, end) =>
      set(state => {
        state.content =
          state.content.slice(0, start) + state.content.slice(end);
      }),
    getSelectedText: () => {
      const state = get();
      return state.selection
        ? state.content.slice(state.selection.start, state.selection.end)
        : null;
    },

    // Format actions
    format: (type, selection) => {
      const state = get();

      // Run before format hooks
      if (state.runBeforeFormat(type, selection) === false) {
        return;
      }

      // Get format commands from plugins
      const formatCommand = Array.from(state.commands.values()).find(
        cmd => cmd.id === `format-${type}`
      );

      if (formatCommand) {
        formatCommand.execute();
      }

      // Run after format hooks
      state.runAfterFormat(type, selection);
    },

    // Format text with prefix and suffix
    formatText: ({
      type,
      prefix,
      suffix,
      selection,
    }: {
      type: FormatType;
      prefix: string;
      suffix: string;
      selection: Selection;
    }) => {
      set(state => {
        const beforeSelection = state.content.slice(0, selection.start);
        const afterSelection = state.content.slice(selection.end);
        const selectedText = selection.text;

        state.content =
          beforeSelection + prefix + selectedText + suffix + afterSelection;
        state.selection = {
          start: selection.start + prefix.length,
          end: selection.end + prefix.length,
          text: selectedText,
        };
      });
    },

    toggleBold: () => {
      const state = get();
      if (state.selection) state.format('bold', state.selection);
    },
    toggleItalic: () => {
      const state = get();
      if (state.selection) state.format('italic', state.selection);
    },
    toggleCode: () => {
      const state = get();
      if (state.selection) state.format('code', state.selection);
    },
    createLink: url => {
      const state = get();
      if (state.selection) state.format('link', state.selection);
    },

    // UI actions
    setToolbarPosition: position =>
      set(state => {
        state.toolbarPosition = position;
      }),
    setShowToolbar: show =>
      set(state => {
        state.showToolbar = show;
      }),

    // Plugin actions
    registerPlugin: plugin =>
      set(state => {
        // Create new Maps to avoid mutating frozen objects
        const newPlugins = new Map(state.plugins);
        const newCommands = new Map(state.commands);
        const newCleanupFunctions = new Map(state.cleanupFunctions);

        newPlugins.set(plugin.id, plugin);

        if (plugin.getCommands) {
          const commands = plugin.getCommands(state as any);
          commands.forEach(command => {
            newCommands.set(command.id, command);
          });
        }

        const cleanup = plugin.setup?.(state as any, {
          emit: (event: string, ...args: any[]) => {
            plugin.hooks?.[event]?.(...args);
          },
          on: (event: string, handler: any) => {
            if (!plugin.hooks) plugin.hooks = {};
            plugin.hooks[event] = handler;
          },
          off: (event: string, handler: any) => {
            if (plugin.hooks?.[event] === handler) {
              delete plugin.hooks[event];
            }
          },
        });
        if (cleanup) {
          newCleanupFunctions.set(plugin.id, cleanup);
        }

        // Update state with new Maps
        state.plugins = newPlugins;
        state.commands = newCommands;
        state.cleanupFunctions = newCleanupFunctions;
      }),

    unregisterPlugin: pluginId =>
      set(state => {
        const newPlugins = new Map(state.plugins);
        const newCleanupFunctions = new Map(state.cleanupFunctions);

        const cleanup = newCleanupFunctions.get(pluginId);
        if (cleanup) cleanup();

        newCleanupFunctions.delete(pluginId);
        newPlugins.delete(pluginId);

        state.plugins = newPlugins;
        state.cleanupFunctions = newCleanupFunctions;
      }),

    getPlugin: pluginId => {
      return get().plugins.get(pluginId);
    },

    registerCommand: command =>
      set(state => {
        const newCommands = new Map(state.commands);
        newCommands.set(command.id, command);
        state.commands = newCommands;
      }),

    unregisterCommand: commandId =>
      set(state => {
        const newCommands = new Map(state.commands);
        newCommands.delete(commandId);
        state.commands = newCommands;
      }),

    executeCommand: (commandId, ...args) => {
      const command = get().commands.get(commandId);
      if (command) command.execute(...args);
    },

    addDecoration: decoration =>
      set(state => {
        const newDecorations = new Map(state.decorations);
        newDecorations.set(decoration.id, decoration);
        state.decorations = newDecorations;
      }),

    removeDecoration: decorationId =>
      set(state => {
        const newDecorations = new Map(state.decorations);
        newDecorations.delete(decorationId);
        state.decorations = newDecorations;
      }),

    getDecorations: () => {
      return Array.from(get().decorations.values());
    },

    updatePluginState: (pluginId, state) => {
      const plugin = get().plugins.get(pluginId);
      if (plugin) {
        plugin.state = state;
      }
    },

    getPluginState: pluginId => {
      const plugin = get().plugins.get(pluginId);
      return plugin?.state as any;
    },

    // Hook runners
    runBeforeContentChange: content => {
      const state = get();
      let newContent = content;
      state.plugins.forEach(plugin => {
        if (plugin.hooks?.beforeContentChange) {
          const result = plugin.hooks.beforeContentChange(newContent);
          if (result) newContent = result;
        }
      });
      return newContent;
    },

    runAfterContentChange: content => {
      get().plugins.forEach(plugin => {
        plugin.hooks?.afterContentChange?.(content);
      });
    },

    runBeforeFormat: (type, selection) => {
      const state = get();
      let shouldContinue = true;
      state.plugins.forEach(plugin => {
        if (plugin.hooks?.beforeFormat) {
          const result = plugin.hooks.beforeFormat(type, selection);
          if (result === false) shouldContinue = false;
        }
      });
      return shouldContinue;
    },

    runAfterFormat: (type, selection) => {
      get().plugins.forEach(plugin => {
        plugin.hooks?.afterFormat?.(type, selection);
      });
    },

    // History actions
    addToUndoStack: item => {
      set(state => {
        state.undoStack.push(item);
        state.lastUndoTime = Date.now();
      });
    },

    clearHistory: () => {
      set(state => {
        state.undoStack = [];
        state.redoStack = [];
        state.lastUndoTime = 0;
      });
    },

    canUndo: () => get().undoStack.length > 0,
    canRedo: () => get().redoStack.length > 0,

    getLastUndoItem: () => get().undoStack[get().undoStack.length - 1],
    getLastRedoItem: () => get().redoStack[get().redoStack.length - 1],

    // Core actions
    initialize: () =>
      set(state => {
        // Initialize with empty maps
        state.plugins = new Map();
        state.commands = new Map();
        state.cleanupFunctions = new Map();
        state.decorations = new Map();

        // Register plugins
        const plugins: Plugin[] = [new AutosavePlugin(), new FormatPlugin()];

        plugins.forEach(plugin => {
          const newPlugins = new Map(state.plugins);
          const newCommands = new Map(state.commands);
          const newCleanupFunctions = new Map(state.cleanupFunctions);

          newPlugins.set(plugin.id, plugin);

          if (plugin.getCommands) {
            const commands = plugin.getCommands(state as any);
            commands.forEach(command => {
              newCommands.set(command.id, command);
            });
          }

          const cleanup = plugin.setup?.(state as any, {
            emit: (event: string, ...args: any[]) => {
              plugin.hooks?.[event]?.(...args);
            },
            on: (event: string, handler: any) => {
              if (!plugin.hooks) plugin.hooks = {};
              plugin.hooks[event] = handler;
            },
            off: (event: string, handler: any) => {
              if (plugin.hooks?.[event] === handler) {
                delete plugin.hooks[event];
              }
            },
          });
          if (cleanup) {
            newCleanupFunctions.set(plugin.id, cleanup);
          }

          state.plugins = newPlugins;
          state.commands = newCommands;
          state.cleanupFunctions = newCleanupFunctions;
        });
      }),

    destroy: () =>
      set(state => {
        // Call cleanup functions
        Array.from(state.cleanupFunctions.values()).forEach(cleanup =>
          cleanup()
        );

        // Reset all maps
        state.cleanupFunctions = new Map();
        state.plugins = new Map();
        state.commands = new Map();
        state.decorations = new Map();

        // Reset other state
        state.content = '';
        state.selection = null;
      }),

    reset: () =>
      set(state => {
        // First destroy
        Array.from(state.cleanupFunctions.values()).forEach(cleanup =>
          cleanup()
        );

        // Reset all maps
        state.plugins = new Map();
        state.commands = new Map();
        state.cleanupFunctions = new Map();
        state.decorations = new Map();

        // Reset other state
        state.content = '';
        state.selection = null;

        // Then initialize
        const plugins: Plugin[] = [new AutosavePlugin(), new FormatPlugin()];

        plugins.forEach(plugin => {
          const newPlugins = new Map(state.plugins);
          const newCommands = new Map(state.commands);
          const newCleanupFunctions = new Map(state.cleanupFunctions);

          newPlugins.set(plugin.id, plugin);

          if (plugin.getCommands) {
            const commands = plugin.getCommands(state as any);
            commands.forEach(command => {
              newCommands.set(command.id, command);
            });
          }

          const cleanup = plugin.setup?.(state as any, {
            emit: (event: string, ...args: any[]) => {
              plugin.hooks?.[event]?.(...args);
            },
            on: (event: string, handler: any) => {
              if (!plugin.hooks) plugin.hooks = {};
              plugin.hooks[event] = handler;
            },
            off: (event: string, handler: any) => {
              if (plugin.hooks?.[event] === handler) {
                delete plugin.hooks[event];
              }
            },
          });
          if (cleanup) {
            newCleanupFunctions.set(plugin.id, cleanup);
          }

          state.plugins = newPlugins;
          state.commands = newCommands;
          state.cleanupFunctions = newCleanupFunctions;
        });
      }),

    // Event handlers
    handleKeyDown: (event: KeyboardEvent) => {
      const state = get();
      const { key, ctrlKey, metaKey } = event;

      if (ctrlKey || metaKey) {
        switch (key.toLowerCase()) {
          case 'z':
            if (event.shiftKey) {
              state.redo();
            } else {
              state.undo();
            }
            event.preventDefault();
            break;

          case 'b':
            state.toggleBold();
            event.preventDefault();
            break;

          case 'i':
            state.toggleItalic();
            event.preventDefault();
            break;

          case '`':
            state.toggleCode();
            event.preventDefault();
            break;
        }
      }
    },

    handlePaste: (event: ClipboardEvent) => {
      event.preventDefault();
      const text = event.clipboardData?.getData('text/plain');
      if (!text) return;

      const state = get();
      if (state.selection) {
        state.deleteText(state.selection.start, state.selection.end);
      }
      state.insertText(text);
    },

    handleDrop: (event: DragEvent) => {
      event.preventDefault();
      const text = event.dataTransfer?.getData('text/plain');
      if (!text) return;

      const state = get();
      if (state.selection) {
        state.deleteText(state.selection.start, state.selection.end);
      }
      state.insertText(text);
    },

    // History actions
    undo: () => {
      const state = get();
      const lastItem = state.getLastUndoItem();
      if (!lastItem) return;

      // Save current state to redo stack
      const currentState: UndoStackItem = {
        content: state.content,
        selection: state.selection ?? {
          start: 0,
          end: 0,
          text: '',
        },
        timestamp: Date.now(),
      };

      set(state => {
        state.redoStack.push(currentState);
        state.undoStack.pop();
        state.content = lastItem.content;
        state.selection = lastItem.selection;
        state.lastUndoTime = Date.now();
      });
    },

    redo: () => {
      const state = get();
      const lastItem = state.getLastRedoItem();
      if (!lastItem) return;

      // Save current state to undo stack
      const currentState: UndoStackItem = {
        content: state.content,
        selection: state.selection ?? {
          start: 0,
          end: 0,
          text: '',
        },
        timestamp: Date.now(),
      };

      set(state => {
        state.undoStack.push(currentState);
        state.redoStack.pop();
        state.content = lastItem.content;
        state.selection = lastItem.selection;
        state.lastUndoTime = Date.now();
      });
    },

    dispatch: (action: { type: string; payload: any }) => {
      const state = get();
      switch (action.type) {
        case 'SET_CONTENT':
          state.setContent(action.payload);
          break;
        case 'SET_SELECTION':
          state.setSelection(action.payload);
          break;
        case 'FORMAT_TEXT':
          state.formatText(action.payload);
          break;
        default:
          console.warn(`Unknown action type: ${action.type}`);
      }
    },

    registerDecoration: decoration =>
      set(state => {
        const newDecorations = new Map(state.decorations);
        newDecorations.set(decoration.id, decoration);
        state.decorations = newDecorations;
      }),

    unregisterDecoration: decorationId =>
      set(state => {
        const newDecorations = new Map(state.decorations);
        newDecorations.delete(decorationId);
        state.decorations = newDecorations;
      }),
  }))
);

export default useEditorStore;
