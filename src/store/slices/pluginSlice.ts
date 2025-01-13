import { StateCreator } from 'zustand';
import type { EditorStore } from '../types';
import type {
  Command,
  Decoration,
  FormatType,
  Selection,
  Editor,
  EditorState,
} from '../../components/editor/types';
import type { Plugin } from '@/components/editor/types/plugin';
import type { PluginState, PluginActions } from '../types';

export interface PluginSlice {
  // State
  plugins: Map<string, Plugin>;
  commands: Map<string, Command>;
  decorations: Map<string, Decoration>;

  // Plugin actions
  registerPlugin: (plugin: Plugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  getPlugin: (pluginId: string) => Plugin | undefined;

  // Command actions
  registerCommand: (command: Command) => void;
  unregisterCommand: (commandId: string) => void;
  executeCommand: (commandId: string) => void;

  // Decoration actions
  addDecoration: (decoration: Decoration) => void;
  removeDecoration: (decorationId: string) => void;
  getDecorations: () => Decoration[];

  // Plugin state management
  updatePluginState: <T>(pluginId: string, state: T) => void;
  getPluginState: <T>(pluginId: string) => T | undefined;

  // Hook runners
  runBeforeContentChange: (content: string) => string | void;
  runAfterContentChange: (content: string) => void;
  runBeforeFormat: (type: FormatType, selection: Selection) => boolean | void;
  runAfterFormat: (type: FormatType, selection: Selection) => void;
}

const mapToArray = <K, V>(map: Map<K, V>): V[] => Array.from(map.values());

export const createEditorAdapter = (store: EditorStore): Editor => {
  return {
    id: 'editor',
    plugins: store.plugins,
    commands: store.commands,
    decorations: store.decorations,
    cleanupFunctions: store.cleanupFunctions,
    state: store,
    dispatch: (action: any) => {
      if (action.type === 'FORMAT_TEXT') {
        store.formatText(action.payload);
      } else if (action.type === 'SET_CONTENT') {
        store.setContent(action.payload);
      } else if (action.type === 'SET_SELECTION') {
        store.setSelection(action.payload);
      }
    },
    subscribe: () => () => {},
    registerPlugin: store.registerPlugin,
    unregisterPlugin: store.unregisterPlugin,
    registerCommand: store.registerCommand,
    executeCommand: store.executeCommand,
    addDecoration: store.addDecoration,
    removeDecoration: store.removeDecoration,
    on: (event: string, handler: (...args: any[]) => void) => {},
    off: (event: string, handler: (...args: any[]) => void) => {},
    update: (updater: () => void) => updater(),
    getSelectedText: () => store.selection,
  };
};

export const createPluginSlice: StateCreator<
  EditorStore,
  [],
  [],
  PluginSlice
> = (set, get) => {
  // Use a WeakMap to store plugin states to avoid memory leaks
  const pluginStates = new WeakMap<Plugin, unknown>();

  const runPluginHooks = <T extends keyof NonNullable<Plugin['hooks']>>(
    hookName: T,
    ...args: Parameters<NonNullable<NonNullable<Plugin['hooks']>[T]>>
  ): ReturnType<NonNullable<NonNullable<Plugin['hooks']>[T]>> | undefined => {
    let result: any = args[0];
    const plugins = Array.from(get().plugins.values());

    for (const plugin of plugins) {
      const hook = plugin.hooks?.[hookName];
      if (!hook) continue;

      let hookResult;
      if (
        hookName === 'beforeContentChange' ||
        hookName === 'afterContentChange'
      ) {
        hookResult = (hook as (content: string) => string | void)(
          args[0] as string
        );
      } else if (hookName === 'beforeFormat' || hookName === 'afterFormat') {
        hookResult = (
          hook as (type: FormatType, selection: Selection) => boolean | void
        )(args[0] as FormatType, args[1] as Selection);
      }

      if (hookResult !== undefined) {
        result = hookResult;
      }
    }
    return result;
  };

  return {
    // State
    plugins: new Map(),
    commands: new Map(),
    decorations: new Map(),

    // Hook runners
    runBeforeContentChange: (content: string) =>
      runPluginHooks('beforeContentChange', content),
    runAfterContentChange: (content: string) =>
      runPluginHooks('afterContentChange', content),
    runBeforeFormat: (type: FormatType, selection: Selection) =>
      runPluginHooks('beforeFormat', type, selection),
    runAfterFormat: (type: FormatType, selection: Selection) =>
      runPluginHooks('afterFormat', type, selection),

    // Actions
    registerPlugin: plugin => {
      const currentPlugin = get().plugins.get(plugin.id);
      if (currentPlugin) {
        // Clean up existing plugin first
        currentPlugin.destroy?.();
      }

      // First update the state with the plugin and its commands/decorations
      set(state => {
        // Store plugin
        state.plugins.set(plugin.id, plugin);

        // Register plugin's commands
        plugin.commands?.forEach(command => {
          state.commands.set(command.id, command);
        });

        // Register plugin's decorations
        plugin.decorations?.forEach(decoration => {
          state.decorations.set(decoration.id, decoration);
        });

        return state;
      });

      // Initialize plugin state
      pluginStates.set(plugin, {});

      // Now that the plugin is registered, initialize it
      const eventBus = {
        emit: (event: string, ...args: any[]) => {},
        on: (event: string, handler: (...args: any[]) => void) => {},
        off: (event: string, handler: (...args: any[]) => void) => {},
      };
      const cleanup = plugin.init?.(createEditorAdapter(get()), eventBus);

      // If there's a cleanup function, store it in a separate update
      if (cleanup) {
        set(state => {
          const registeredPlugin = state.plugins.get(plugin.id);
          if (registeredPlugin) {
            registeredPlugin.destroy = cleanup;
          }
          return state;
        });
      }
    },

    unregisterPlugin: pluginId => {
      set(state => {
        const plugin = state.plugins.get(pluginId);
        if (!plugin) return state;

        // Call plugin's destroy function
        plugin.destroy?.();

        // Remove plugin's commands
        plugin.commands?.forEach(command => {
          state.commands.delete(command.id);
        });

        // Remove plugin's decorations
        plugin.decorations?.forEach(decoration => {
          state.decorations.delete(decoration.id);
        });

        // Remove plugin and its state
        state.plugins.delete(pluginId);
        pluginStates.delete(plugin);

        return state;
      });
    },

    getPlugin: pluginId => get().plugins.get(pluginId),

    registerCommand: command =>
      set(state => {
        state.commands.set(command.id, command);
        return state;
      }),

    unregisterCommand: commandId =>
      set(state => {
        state.commands.delete(commandId);
        return state;
      }),

    executeCommand: commandId => {
      const command = get().commands.get(commandId);
      if (!command) {
        throw new Error(`Command with id ${commandId} not found`);
      }
      if (command.isEnabled?.() === false) return;
      command.execute();
    },

    addDecoration: decoration =>
      set(state => {
        state.decorations.set(decoration.id, decoration);
        return state;
      }),

    removeDecoration: decorationId =>
      set(state => {
        state.decorations.delete(decorationId);
        return state;
      }),

    getDecorations: () => Array.from(get().decorations.values()),

    updatePluginState: <T>(pluginId: string, newState: T) => {
      const plugin = get().plugins.get(pluginId);
      if (plugin) {
        pluginStates.set(plugin, newState);
      }
    },

    getPluginState: <T>(pluginId: string): T | undefined => {
      const plugin = get().plugins.get(pluginId);
      return plugin ? (pluginStates.get(plugin) as T) : undefined;
    },
  };
};
