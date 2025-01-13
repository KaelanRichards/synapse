import { nanoid } from 'nanoid';
import type {
  Editor,
  Plugin,
  Command,
  Decoration,
  EditorState,
  EditorAction,
  Selection,
  FormatType,
} from './types';

type Subscriber = (state: EditorState) => void;

export class EditorCore implements Editor {
  public readonly id: string;
  public plugins: Plugin[] = [];
  public commands: Map<string, Command> = new Map();
  public decorations: Map<string, Decoration> = new Map();
  public state: EditorState;
  private pluginDestroyHandlers: Map<string, () => void> = new Map();
  private subscribers: Set<Subscriber> = new Set();

  constructor(initialState: Partial<EditorState> = {}) {
    this.id = nanoid();
    this.state = {
      content: '',
      selection: null,
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
      isLocalFocusMode: false,
      isParagraphFocus: false,
      isAmbientSound: false,
      showToolbar: false,
      toolbarPosition: { x: 0, y: 0 },
      plugins: {},
      decorations: [],
      commands: [],
      ...initialState,
    };
  }

  public subscribe = (subscriber: Subscriber): (() => void) => {
    this.subscribers.add(subscriber);
    subscriber(this.state); // Initial state
    return () => {
      this.subscribers.delete(subscriber);
    };
  };

  private notifySubscribers = (): void => {
    this.subscribers.forEach(subscriber => subscriber(this.state));
  };

  public dispatch = (action: EditorAction): void => {
    // Pre-action hooks
    if (action.type === 'SET_CONTENT') {
      const newContent = this.runPluginHooks(
        'beforeContentChange',
        action.payload
      );
      if (typeof newContent === 'string') {
        action.payload = newContent;
      }
    }

    // Update state
    this.state = this.reducer(this.state, action);

    // Post-action hooks
    if (action.type === 'SET_CONTENT') {
      this.runPluginHooks('afterContentChange', this.state.content);
    }

    // Notify subscribers
    this.notifySubscribers();
  };

  public registerPlugin = (plugin: Plugin): void => {
    if (this.plugins.some(p => p.id === plugin.id)) {
      throw new Error(`Plugin with id ${plugin.id} is already registered`);
    }

    // Initialize plugin
    if (plugin.init) {
      const destroyHandler = plugin.init(this);
      if (typeof destroyHandler === 'function') {
        this.pluginDestroyHandlers.set(plugin.id, destroyHandler);
      }
    }

    // Register commands
    plugin.commands?.forEach(this.registerCommand);

    // Register decorations
    plugin.decorations?.forEach(this.addDecoration);

    this.plugins.push(plugin);
    this.dispatch({ type: 'REGISTER_PLUGIN', payload: plugin });
  };

  public unregisterPlugin = (pluginId: string): void => {
    const plugin = this.plugins.find(p => p.id === pluginId);
    if (!plugin) return;

    // Cleanup plugin
    const destroyHandler = this.pluginDestroyHandlers.get(pluginId);
    if (destroyHandler) {
      destroyHandler();
      this.pluginDestroyHandlers.delete(pluginId);
    }

    // Remove commands
    plugin.commands?.forEach(cmd => this.commands.delete(cmd.id));

    // Remove decorations
    plugin.decorations?.forEach(dec => this.decorations.delete(dec.id));

    this.plugins = this.plugins.filter(p => p.id !== pluginId);
    this.dispatch({ type: 'UNREGISTER_PLUGIN', payload: pluginId });
  };

  public registerCommand = (command: Command): void => {
    if (this.commands.has(command.id)) {
      throw new Error(`Command with id ${command.id} is already registered`);
    }
    this.commands.set(command.id, command);
    this.dispatch({ type: 'REGISTER_COMMAND', payload: command });
  };

  public executeCommand = (commandId: string): void => {
    const command = this.commands.get(commandId);
    if (!command) {
      throw new Error(`Command with id ${commandId} not found`);
    }
    if (command.isEnabled?.() === false) return;
    command.execute();
  };

  public addDecoration = (decoration: Decoration): void => {
    if (this.decorations.has(decoration.id)) {
      throw new Error(`Decoration with id ${decoration.id} already exists`);
    }
    this.decorations.set(decoration.id, decoration);
    this.dispatch({ type: 'ADD_DECORATION', payload: decoration });
  };

  public removeDecoration = (decorationId: string): void => {
    if (!this.decorations.has(decorationId)) return;
    this.decorations.delete(decorationId);
    this.dispatch({ type: 'REMOVE_DECORATION', payload: decorationId });
  };

  private runPluginHooks<T extends keyof NonNullable<Plugin['hooks']>>(
    hookName: T,
    ...args: Parameters<NonNullable<NonNullable<Plugin['hooks']>[T]>>
  ): ReturnType<NonNullable<NonNullable<Plugin['hooks']>[T]>> | undefined {
    let result: any = args[0];
    for (const plugin of this.plugins) {
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
  }

  private reducer(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
      case 'SET_CONTENT':
        return { ...state, content: action.payload };
      case 'SET_SELECTION':
        return { ...state, selection: action.payload };
      case 'ADD_TO_UNDO_STACK':
        return {
          ...state,
          undoStack: [...state.undoStack, action.payload],
          lastUndoTime: action.payload.timestamp,
        };
      case 'UNDO':
        if (state.undoStack.length < 2) return state;
        const previousState = state.undoStack[state.undoStack.length - 2];
        return {
          ...state,
          content: previousState.content,
          selection: previousState.selection,
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [
            ...state.redoStack,
            state.undoStack[state.undoStack.length - 1],
          ],
        };
      case 'REDO':
        if (state.redoStack.length === 0) return state;
        const nextState = state.redoStack[state.redoStack.length - 1];
        return {
          ...state,
          content: nextState.content,
          selection: nextState.selection,
          undoStack: [...state.undoStack, nextState],
          redoStack: state.redoStack.slice(0, -1),
        };
      case 'UPDATE_STATS':
        const words = state.content.trim().split(/\s+/).filter(Boolean).length;
        const lines = state.content.split('\n').length;
        const readingTime = Math.ceil(words / 200);
        return {
          ...state,
          stats: {
            ...state.stats,
            wordCount: words,
            charCount: state.content.length,
            linesCount: lines,
            readingTime,
          },
        };
      case 'SET_SAVE_STATUS':
        return { ...state, saveStatus: action.payload };
      case 'TOGGLE_FOCUS_MODE':
        return { ...state, isLocalFocusMode: !state.isLocalFocusMode };
      case 'TOGGLE_PARAGRAPH_FOCUS':
        return { ...state, isParagraphFocus: !state.isParagraphFocus };
      case 'TOGGLE_AMBIENT_SOUND':
        return { ...state, isAmbientSound: !state.isAmbientSound };
      case 'SET_TOOLBAR_VISIBILITY':
        return { ...state, showToolbar: action.payload };
      case 'SET_TOOLBAR_POSITION':
        return { ...state, toolbarPosition: action.payload };
      case 'REGISTER_PLUGIN':
        return {
          ...state,
          plugins: { ...state.plugins, [action.payload.id]: {} },
        };
      case 'UNREGISTER_PLUGIN':
        const { [action.payload]: _, ...remainingPlugins } = state.plugins;
        return { ...state, plugins: remainingPlugins };
      case 'UPDATE_PLUGIN_STATE':
        return {
          ...state,
          plugins: {
            ...state.plugins,
            [action.payload.pluginId]: action.payload.state,
          },
        };
      case 'ADD_DECORATION':
        return {
          ...state,
          decorations: [...state.decorations, action.payload],
        };
      case 'REMOVE_DECORATION':
        return {
          ...state,
          decorations: state.decorations.filter(d => d.id !== action.payload),
        };
      case 'REGISTER_COMMAND':
        return {
          ...state,
          commands: [...state.commands, action.payload],
        };
      case 'UNREGISTER_COMMAND':
        return {
          ...state,
          commands: state.commands.filter(c => c.id !== action.payload),
        };
      default:
        return state;
    }
  }
}
